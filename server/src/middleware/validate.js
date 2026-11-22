import {AppError} from '../utils/AppErrors.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
    const  result = schema.safeParse(req[source]);
    if(!result.success){
        const  details = result.error.issues.map(issue => ({field : issue.path.join('.'), message : issue.message}));
        return next(new AppError(400, 'Validation Error', details));
    }
    req.validated = req.validated || {};
    req.validated[source] = result.data;
    next();
}