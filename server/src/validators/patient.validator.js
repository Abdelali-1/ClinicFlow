import {z} from 'zod';

export const idParam = z.object({id: z.string().uuid("Invalid UUID format")});

export const  patientSchema = z.object({
    full_name : z.string()
                .min(1, "Full name cannot be empty")
                .max(120, "Full name cannot exceed 100 characters"),

    cin : z.string()
            .min(1, "CIN cannot be empty")
            .max(20, "CIN cannot exceed 20 characters")
            .transform((val) => val.toUpperCase()),

    phone: z.string()
            .min(1, "Phone number cannot be empty")
            .max(20, "Phone number cannot exceed 20 characters"),

    birth_date: z.string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format")
                .refine((val)=> new Date(val) <= new Date(), "Birth date cannot be in the future"),

    address: z.string()
            .trim()
            .max(200, "Address cannot exceed 200 characters")
            .nullish()
});


export const listPatientsQuery = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// export const listPatientsSchema = z.object({
//     page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1),
//     limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10),
//     search: z.string().optional().transform((val) => val ? val.trim() : ''),
// });

