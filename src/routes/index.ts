import { Router } from "express";
import userRoute from "../app/modules/user/user.route";
import authRouter from "../app/modules/auth/auth.route";
import parcelRoute from "../app/modules/parcel/parcel.route";
import metaRoute from "../app/modules/meta/meta.route";

const routes = Router();

routes.use("/user", userRoute);
routes.use("/auth", authRouter);
routes.use("/parcel", parcelRoute);
routes.use("/meta", metaRoute);

export default routes;
