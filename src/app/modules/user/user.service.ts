import { IUser } from "./user.interface";
import User from "./user.model";
import * as bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import AppError from "../../../error/AppError";
import { envVars } from "../../config/env";

const registerUser = async (payload: IUser) => {
  payload.password = await bcrypt.hash(payload.password, 10);

  const user = new User(payload);

  const data = await user.save();

  return data;
};

const loginUser = async (payload: IUser) => {
  const isUserExist = await User.findOne({ email: payload.email });

  if (!isUserExist) throw new AppError(404, "User Not Found");

  const checkPassword = await bcrypt.compare(
    payload.password,
    isUserExist.password
  );
  if (!checkPassword) throw new AppError(403, "Password not matched");

  const jwtPayload = {
    email: payload.email,
    role: isUserExist.role,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
  );

  const refreshToken = jwt.sign(
    jwtPayload,
    envVars.JWT_REFRESH_SECRET as string,
    { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifyRefreshToken = jwt.verify(
    refreshToken,
    envVars.JWT_REFRESH_SECRET as string
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifyRefreshToken.email });
  if (!isUserExist) throw new AppError(404, "User Not Found");

  const jwtPayload = {
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = jwt.sign(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET as string,
    { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
  );

  return { accessToken };
};

const getSingleUser = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

const blockUser = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { isBlocked: "BLOCKED" },
    { new: true }
  );
};

const unblockUser = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    id,
    { isBlocked: "UNBLOCKED" },
    { new: true }
  );
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const getAllReceivers = async () => {
  // Fetch users where role is RECEIVER
  return await User.find({
    role: "RECEIVER",
    isBlocked: { $ne: "BLOCKED" },
  }).select("_id name email");
};

export const userService = {
  registerUser,
  loginUser,
  refreshToken,
  getSingleUser,
  blockUser,
  unblockUser,
  getMe,
  getAllReceivers,
};
