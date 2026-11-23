import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { idParam } from '../validators/patient.validator.js';
import {
    appointmentSchema, 
    listAppointmentQuery, 
    updateStatusSchema} from '../validators/appointment.validator.js';
import * as ctrl from '../controllers/appointment.controller.js'

const r = Router();

r.use(authenticate);
r.post('/', validate(appointmentSchema), ctrl.create);
r.get('/', validate(listAppointmentQuery, 'query'), ctrl.list)
r.patch('/:id', validate(idParam, 'params'), validate(appointmentSchema), ctrl.updateStatus);

export default r;