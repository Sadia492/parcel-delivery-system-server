import { Request, Response, NextFunction } from "express";

export const checkUserBlocked = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Assuming you have req.user populated from your JWT middleware
  console.log(req.user);
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (user.isBlocked === "BLOCKED") {
    return res
      .status(403)
      .json({ message: "Access denied: Your account is blocked." });
  }

  next();
};
