import { NextFunction, Request, Response } from "express";

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(403).send({ message: "Error: Not logged in or insufficient privileges" });
  }
  next();
}

export function requireEditorRights(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user && !req.user.isEditor) {
    return res.status(403).send({ message: "Error: Not logged in or insufficient privileges" });
  }
  next();
}

export function requireAdminRights(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user && !req.user.isAdmin) {
    return res.status(403).send({ message: "Error: Not logged in or insufficient privileges" });
  }
  next();
}
