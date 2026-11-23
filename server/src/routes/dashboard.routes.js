import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {stats} from '../controllers/dashboard.controller.js'

const r = Router();
r.get('/stats',authenticate, stats);