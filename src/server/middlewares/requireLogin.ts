import { NextFunction, Request, Response } from "express";

export default function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).send({ message: "Wrong username or password" });
  }
  next();
}
