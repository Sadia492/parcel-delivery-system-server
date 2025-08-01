import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../../middleware/auth";
import { Role } from "../user/user.interface";

const authRouter = Router();

authRouter.post(
  "/change-password",
  auth([Role.SENDER, Role.RECEIVER, Role.ADMIN]),
  authController.changePassword
);

authRouter.post("/reset-password", authController.resetPassword);

authRouter.post("/logout", authController.logout);

export default authRouter;
