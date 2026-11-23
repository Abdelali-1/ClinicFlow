import {z} from 'zod';

export const STATUSES = ['pending', 'confirmed', 'cancelled'];

export const appointmentSchema = z.object({
    patient_id: z.string()
                .uuid("Invalid UUID format"),
    appointment_date: z.coerce.date("Appointment date is required"),
    status: z.enum(STATUSES, "Invalid status value").default('pending'),
    reason: z.string()
            .trim()
            .max(255, "Reason cannot exceed 255 characters")
            .min(3, "Reason cannot be empty"),
    notes: z.string()
            .trim()
            .max(2000)
            .nullish() 
});

export const listAppointmentQuery = z.object({
    date : z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
            .optional(),
    status: z.enum(STATUSES)
            .optional(),
    patientId: z.string()
                .uuid()
                .optional(),
});

export const updateStatusSchema = z.object({status : z.enum(STATUSES)})