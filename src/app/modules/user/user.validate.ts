import z from "zod";
import { IsBlocked, Role } from "./user.interface";

const userCreateZodSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(255, "Name can't be more than 255 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([Role.ADMIN, Role.SENDER, Role.RECEIVER]).optional(),
  isBlocked: z.enum([IsBlocked.BLOCKED, IsBlocked.UNBLOCKED]).optional(),
});

const userLoginZodSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string(),
});

export const userZodSchema = {
  userCreateZodSchema,
  userLoginZodSchema,
};
