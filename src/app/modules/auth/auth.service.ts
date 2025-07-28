import AppError from "../../../error/AppError";
import { envVars } from "../../config/env";
import User from "../user/user.model";
import * as bcrypt from "bcrypt";

const changePassword = async (
  email: string,
  newPassword: string,
  oldPassword: string
) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new AppError(404, "User Not Found");

  const storedPassword = await isUserExist.password;

  const isMatchedPassword = await bcrypt.compare(oldPassword, storedPassword);
  if (!isMatchedPassword) throw new AppError(403, "Password Not Matched");

  isUserExist.password = await bcrypt.hash(
    newPassword,
    envVars.PASSWORD_SALT_ROUND!
  );
  await isUserExist.save();

  return isUserExist;
};

const resetPassword = async (email: string, password: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) throw new AppError(404, "User Not Found");

  isUserExist.password = await bcrypt.hash(
    password,
    envVars.PASSWORD_SALT_ROUND!
  );
  await isUserExist.save();

  return {
    email: isUserExist.email,
  };
};

export const authService = {
  changePassword,
  resetPassword,
};
