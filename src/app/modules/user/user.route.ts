import { Router } from "express";
import { getUsers } from "./user.controller";

const userRoute = Router();
userRoute.get("/", getUsers);

export default userRoute;
