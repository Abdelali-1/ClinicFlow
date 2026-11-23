import {Router} from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema } from '../validators/auth.validator.js';
import * as ctrl from '../controllers/auth.controller.js';

const  r = Router();
r.post('/login', validate(loginSchema), ctrl.login);
r.get('/me',authenticate,ctrl.me);

export default r;
