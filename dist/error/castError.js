"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCastValidationError = void 0;
const env_1 = require("../app/config/env");
const handleCastValidationError = (error) => {
    const statusCode = 400;
    const message = "Invalid ID";
    const errorMessage = `${error.value} is not a valid ID!`;
    return {
        statusCode,
        message,
        errorMessage,
        errorDetails: error,
        stack: env_1.envVars.NODE_ENV === "development" ? error.stack : undefined,
    };
};
exports.handleCastValidationError = handleCastValidationError;
