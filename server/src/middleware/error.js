import {AppError} from "../utils/AppErrors.js";

export const notFound  = (req, res, next) => 
    next(new AppError(404, 'Not Found', `The requested URL ${req.originalUrl} was not found`));

export const errorHandler = (err, req, res, next) => {
    if(err.code === '23505'){
        return res.status(409).json({status: 409, message: 'value already exists'});
    }
    if(err.code === '22P02'){
        return res.status(400).json({status: 400, message: 'Invalid Identifier format'});
    }
    if(err.type === 'entity.parse.failed'){
        return res.status(400).json({status: 400, message: 'Invalid JSON format'});
    }
    const status = err.status || 500;
    if(status === 500){
        console.error(err);
    }
    return res.status(status).json({
        status,
        message: status === 500 ? 'Internal Server Error' : err.message,
        details: err.details || null
    });
}