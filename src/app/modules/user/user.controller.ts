import { NextFunction, Request, Response } from "express";
import User from "./user.model";
import { userService } from "./user.service";
import httpStatus from "http-status";
import { envVars } from "../../config/env";
import { sendResponse } from "../../../utils/sendResponse";
import { catchAsync } from "../../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await userService.registerUser(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.blockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.unblockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User unblocked successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await userService.loginUser(payload);

  // For production: use 'none' and secure: true
  const isProduction = envVars.NODE_ENV === "production";

  res.cookie("accessToken", data.accessToken, {
    secure: isProduction, // true in production, false in development
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax", // Critical fix!
    maxAge: 15 * 60 * 1000, // 15 minutes for access token
  });

  res.cookie("refreshToken", data.refreshToken, {
    secure: isProduction, // true in production, false in development
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax", // Critical fix!
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
  });

  // res.cookie("accessToken", data.accessToken, {
  //   secure: envVars.NODE_ENV !== "development",
  //   httpOnly: true,
  //   sameSite: "none",
  // });

  // res.cookie("refreshToken", data.refreshToken, {
  //   secure: envVars.NODE_ENV !== "development",
  //   httpOnly: true,
  //   sameSite: "none",
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Login Successfully",
    data,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const data = await userService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data,
  });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const data = await User.find();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved Successfully",
    data,
  });
});
const getMe = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await userService.getMe(decodedToken._id);
  console.log(result);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your profile Retrieved Successfully",
    data: result.data,
  });
});
// src/modules/user/user.controller.ts
const getAllReceivers = catchAsync(async (req: Request, res: Response) => {
  const receivers = await userService.getAllReceivers();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Receivers fetched successfully",
    data: receivers,
  });
});

export {
  registerUser,
  loginUser,
  getUsers,
  refreshToken,
  getSingleUser,
  blockUser,
  unblockUser,
  getMe,
  getAllReceivers,
};
