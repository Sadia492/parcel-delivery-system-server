"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
const userCreateZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(3, "Name must be at least 3 characters")
        .max(255, "Name can't be more than 255 characters"),
    email: zod_1.default.email("Invalid email address"),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.default.enum([user_interface_1.Role.ADMIN, user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER]).optional(),
    isBlocked: zod_1.default.enum([user_interface_1.IsBlocked.BLOCKED, user_interface_1.IsBlocked.UNBLOCKED]).optional(),
});
const userLoginZodSchema = zod_1.default.object({
    email: zod_1.default.email("Invalid email address"),
    password: zod_1.default.string(),
});
exports.userZodSchema = {
    userCreateZodSchema,
    userLoginZodSchema,
};
