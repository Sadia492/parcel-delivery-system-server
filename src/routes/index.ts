import { Router } from "express";
import userRoute from "../app/modules/user/user.route";
import authRouter from "../app/modules/auth/auth.route";

const routes = Router();

routes.use("/user", userRoute);
routes.use("/auth", authRouter);

export default routes;
