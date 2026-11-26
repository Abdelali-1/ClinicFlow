import { z } from "zod";

export const STATUSES = ["pending", "confirmed", "cancelled"];

export const appointmentSchema = z.object({
    patientId: z.string()
        .uuid("Format UUID invalide"),

    appointmentDate: z.coerce.date("La date du rendez-vous est obligatoire."),

    status: z.enum(STATUSES, "Statut invalide")
        .default("pending"),

    reason: z.string()
        .trim()
        .max(255, "Le motif ne peut pas dépasser 255 caractères.")
        .min(3, "Le motif doit contenir au moins 3 caractères."),

    notes: z.string()
        .trim()
        .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères.")
        .nullish()
});

export const listAppointmentQuery = z.object({
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit respecter le format AAAA-MM-JJ.")
        .optional(),

    status: z.enum(STATUSES, "Statut invalide")
        .optional(),

    patientId: z.string()
        .uuid("Format UUID invalide")
        .optional(),
});

export const updateStatusSchema = z.object({
    status: z.enum(STATUSES, "Statut invalide")
});