"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateValidationError = void 0;
const env_1 = require("../app/config/env");
const handleDuplicateValidationError = (error) => {
    const statusCode = 409;
    const message = "Duplicate Error";
    let extractKey = "unknownKey";
    let extractValue = "unknownValue";
    const keyMatch = error.message.match(/dup key: \{ (\w+):/);
    const valueMatch = error.message.match(/"([^"]+)"/);
    if (keyMatch && keyMatch.length > 1) {
        extractKey = keyMatch[1];
    }
    if (valueMatch && valueMatch.length > 1) {
        extractValue = valueMatch[1];
    }
    const errorMessage = `${extractKey}: '${extractValue}' already exists!`;
    return {
        statusCode,
        message,
        errorMessage,
        errorDetails: error,
        stack: env_1.envVars.NODE_ENV === "development" ? error.stack : undefined,
    };
};
exports.handleDuplicateValidationError = handleDuplicateValidationError;
