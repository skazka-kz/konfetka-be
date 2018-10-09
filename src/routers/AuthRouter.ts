import { NextFunction, Request, Response, Router } from "express";
import * as passport from "passport";

class AuthRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public routes(): void {
    this.router.post("/login", this.login);
    this.router.get("/logout", this.logout);
    this.router.get("/user", this.getCurrentUser);
  }
  private logout(req: Request, res: Response): void {
    if (req.user) {
      req.logout();
      req.session = null;
      res.send({ message: "Logged out" }).clearCookie("session").clearCookie("session.sig");
    } else {
      res.status(403).send({ message: "Error: Not logged in" });
    }
  }
  private getCurrentUser(req: Request, res: Response): void {
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(403).send({ message: "Error: Not logged in" });
    }
  }
  private login(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .send({ message: "Error: Wrong email or password" });
      }
      req.logIn(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        user.password = undefined;
        res.send(user);
      });
    })(req, res, next);
  }
}

const au = new AuthRouter();

export default au.router;
