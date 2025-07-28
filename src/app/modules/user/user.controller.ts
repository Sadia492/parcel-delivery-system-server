import { Request, Response } from "express";
import User from "./user.model";
import { userService } from "./user.service";
import httpStatus from "http-status";
import { envVars } from "../../config/env";
import { sendResponse } from "../../../utils/sendResponse";

const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await userService.registerUser(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data,
  });
};

const getSingleUser = async (req: Request, res: Response) => {
  const result = await userService.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
};

const blockUser = async (req: Request, res: Response) => {
  const result = await userService.blockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User blocked successfully",
    data: result,
  });
};

const unblockUser = async (req: Request, res: Response) => {
  const result = await userService.unblockUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User unblocked successfully",
    data: result,
  });
};

const loginUser = async (req: Request, res: Response) => {
  const payload = req.body;

  const data = await userService.loginUser(payload);

  res.cookie("accessToken", data.accessToken, {
    secure: envVars.NODE_ENV !== "development",
    httpOnly: true,
    sameSite: "lax",
  });

  res.cookie("refreshToken", data.refreshToken, {
    secure: envVars.NODE_ENV !== "development",
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Login Successfully",
    data,
  });
};

const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const data = await userService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Registered Successfully",
    data,
  });
};

const getUsers = async (req: Request, res: Response) => {
  const data = await User.find();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved Successfully",
    data,
  });
};

export {
  registerUser,
  loginUser,
  getUsers,
  refreshToken,
  getSingleUser,
  blockUser,
  unblockUser,
};
