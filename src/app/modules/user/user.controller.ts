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

  // Set cookies with proper domain for cross-domain usage
  res.cookie("accessToken", data.accessToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
  });

  res.cookie("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "none",
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
  const user = req.user; // already a User object
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Your profile Retrieved Successfully",
    data: user,
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
