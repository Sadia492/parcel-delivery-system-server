"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET",
        "JWT_ACCESS_EXPIRES",
        "JWT_REFRESH_EXPIRES",
        "PASSWORD_SALT_ROUND",
        "FRONTEND_URL",
    ];
    requiredEnvVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing env variables ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        PASSWORD_SALT_ROUND: Number(process.env.PASSWORD_SALT_ROUND),
        FRONTEND_URL: process.env.FRONTEND_URL,
    };
};
exports.envVars = loadEnvVariables();
