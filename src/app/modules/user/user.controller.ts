import { Request, Response } from "express";
import User from "./user.model";

const getUsers = async (req: Request, res: Response) => {
  const data = await User.find();

  res.send(data);

  //   sendResponse(res, {
  //     statusCode: httpStatus.OK,
  //     success: true,
  //     message: 'User retrieved Successfully',
  //     data,
  //   });
};
export { getUsers };
