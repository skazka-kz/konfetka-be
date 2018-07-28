import { NextFunction, Request, Response } from "express";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      res.status(400).send({ message: "File and/or request too large" });
      break;
    default:
      res.status(500).send({ message: "Server error" });
  }
}
