import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.route.js';
import patientRoute from './routes/patient.route.js';
import appointmentRoute from './routes/appointment.route.js';
import dashboardRoute from './routes/dashboard.routes.js';
import { notFound,errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({
    origin: env.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health',(req,res) => res.json({status : "ok"}));
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/dashboard', dashboardRoute);

app.use(notFound);
app.use(errorHandler);

export default app;


