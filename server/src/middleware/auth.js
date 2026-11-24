import jwt from 'jsonwebtoken';
import {env} from '../config/env.js';
import {AppError} from '../utils/AppErrors.js';

export const authenticate = (req, res, next) => {
    const [type, token] = (req.headers.authorization || '').split(' ');
    if(type !== 'Bearer' || !token){
        return next(new AppError(401, 'Unauthorized', 'Authentication required'));
    }
    try{
        const payload = jwt.verify(token, env.jwtSecret);
        req.user = {id: payload.sub, role: payload.role};
        next();
    } catch (error) {
        return next(new AppError(401, 'Unauthorized', 'Invalid token'));
    }
};

export const RequiredRole = (...roles) => (req, res, next) => 
    roles.includes(req.user.role) 
        ? next() 
        : next(new AppError(403, 'Forbidden', 'You do not have permission to access this resource'));
