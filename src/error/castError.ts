import mongoose from "mongoose";
import { TErrorResponse } from "../interfaces/error";
import { envVars } from "../app/config/env";

export const handleCastValidationError = (
  error: mongoose.Error.CastError
): TErrorResponse => {
  const statusCode = 400;
  const message = "Invalid ID";
  const errorMessage = `${error.value} is not a valid ID!`;

  return {
    statusCode,
    message,
    errorMessage,
    errorDetails: error,
    stack: envVars.NODE_ENV === "development" ? error.stack : undefined,
  };
};
