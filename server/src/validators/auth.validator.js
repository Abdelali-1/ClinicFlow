import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .min(1, "L'adresse e-mail est obligatoire.")
        .email("Adresse e-mail invalide.")
        .toLowerCase(),

    password: z.string()
        .min(1, "Le mot de passe est obligatoire."),
});