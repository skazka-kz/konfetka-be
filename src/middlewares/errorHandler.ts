import { NextFunction, Request, Response } from "express";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return res.status(400).send({ message: "File and/or request too large" });
    default:
      if (err.match(/duplicate key/)) {
        return res
          .status(400)
          .send({ message: "Error: User with such email already exists" });
      }
      return res.status(500).send({ message: err });
  }
}
