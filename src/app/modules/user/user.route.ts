import { Router } from "express";
import {
  blockUser,
  getAllReceivers,
  getMe,
  getSingleUser,
  getUsers,
  loginUser,
  refreshToken,
  registerUser,
  unblockUser,
} from "./user.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { Role } from "./user.interface";
import { auth } from "../../../middleware/auth";
import { userZodSchema } from "./user.validate";

const userRoute = Router();

userRoute.post(
  "/",
  validateRequest(userZodSchema.userCreateZodSchema),
  registerUser
);

userRoute.post(
  "/login",
  validateRequest(userZodSchema.userLoginZodSchema),
  loginUser
);

userRoute.post("/refresh-token", refreshToken);
userRoute.get("/receivers", auth([Role.SENDER]), getAllReceivers);
userRoute.get("/", auth([Role.ADMIN]), getUsers);
userRoute.get("/me", auth([Role.ADMIN, Role.RECEIVER, Role.SENDER]), getMe);
userRoute.get("/:id", getSingleUser);
userRoute.patch("/block/:id", auth([Role.ADMIN]), blockUser);
userRoute.patch("/unblock/:id", auth([Role.ADMIN]), unblockUser);
export default userRoute;
