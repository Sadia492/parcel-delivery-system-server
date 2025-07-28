import { Router } from "express";
import userRoute from "../app/modules/user/user.route";

const routes = Router();

routes.use("/user", userRoute);

export default routes;
