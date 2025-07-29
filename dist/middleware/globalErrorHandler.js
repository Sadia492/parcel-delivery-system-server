"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const castError_1 = require("../error/castError");
const duplicateError_1 = require("../error/duplicateError");
const env_1 = require("../app/config/env");
const globalErrorHandler = (error, req, res, next) => {
    // Handle Cast Validation Error
    if ((error === null || error === void 0 ? void 0 : error.name) === "CastError") {
        const result = (0, castError_1.handleCastValidationError)(error);
        return res.status(result.statusCode).json({
            success: false,
            message: result.message,
            errorMessage: result.errorMessage,
            errorDetails: result.errorDetails,
            stack: env_1.envVars.NODE_ENV === "development" ? result.stack : undefined,
        });
    }
    // Handle Duplicate Validation Error
    if (error.code === 11000) {
        const result = (0, duplicateError_1.handleDuplicateValidationError)(error);
        return res.status(result.statusCode).json({
            success: false,
            message: result.message,
            errorMessage: result.errorMessage,
            errorDetails: result.errorDetails,
            stack: env_1.envVars.NODE_ENV === "development" ? result.stack : undefined,
        });
    }
    // Handle other errors
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong!";
    return res.status(statusCode).json({
        success: false,
        message,
        errorMessage: error.message,
        errorDetails: error,
        stack: env_1.envVars.NODE_ENV === "development" ? error.stack : undefined,
    });
};
exports.globalErrorHandler = globalErrorHandler;
