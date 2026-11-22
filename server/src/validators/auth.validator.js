import {z} from 'zod';

export const loginSchema = z.object({
    email: z.trim()
            .string("Email is required")
            .email("Invalid email address")
            .toLowerCase(),
    password: z.string("Password is required")
                .min(1, "Password must be at least 6 characters long"),
});