import { z } from "zod";

export const idParam = z.object({
    id: z.string().uuid("Format UUID invalide")
});

export const patientSchema = z.object({
    fullName: z.string()
        .min(1, "Le nom complet ne peut pas être vide.")
        .max(120, "Le nom complet ne peut pas dépasser 120 caractères."),

    cin: z.string()
        .min(1, "La CIN ne peut pas être vide.")
        .max(20, "La CIN ne peut pas dépasser 20 caractères.")
        .transform((val) => val.toUpperCase()),

    phone: z.string()
        .min(1, "Le numéro de téléphone ne peut pas être vide.")
        .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères."),

    birthDate: z.string()
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "La date de naissance doit respecter le format AAAA-MM-JJ."
        )
        .refine(
            (val) => new Date(val) <= new Date(),
            "La date de naissance ne peut pas être dans le futur."
        ),

    address: z.string()
        .trim()
        .max(200, "L'adresse ne peut pas dépasser 200 caractères.")
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

