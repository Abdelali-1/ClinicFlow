import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticate, RequiredRole } from "../middleware/auth.js";
import { patientSchema, idParam, listPatientsQuery } from "../validators/patient.validator.js";
import * as ctrl from "../controllers/patient.controller.js"

const r = Router();

r.use(authenticate);
r.post('/', validate(patientSchema), ctrl.create);
r.get('/', validate(listPatientsQuery, 'query'), ctrl.list);
r.get('/:id', validate(idParam, 'params'), ctrl.getOne);
r.put('/:id', validate(idParam, 'params'), validate(patientSchema), ctrl.update);
r.delete('/:id', RequiredRole('admin'), validate(idParam, 'params'), ctrl.remove);

export default r;


