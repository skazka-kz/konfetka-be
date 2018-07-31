import { Request, Response } from "express";

export default function ping(req: Request, res: Response) {
  return res.send({ message: "Pong" });
}
