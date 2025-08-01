import { Request, Response } from "express";
import { authService } from "./auth.service";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;

  const { newPassword, oldPassword } = req.body || {};

  const result = await authService.changePassword(
    email,
    newPassword,
    oldPassword
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Changed successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.resetPassword(email, password);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password Reset successfully",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successfully",
    data: null,
  });
});

export const authController = {
  changePassword,
  resetPassword,
  logout,
};
