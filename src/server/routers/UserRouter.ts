import { Request, Response, Router } from "express";
import User from "../models/User";

class UserRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  public async GetUsers(req: Request, res: Response) {
    const users = await User.find();
    return res.send(users);
  }
  public async GetUser(req: Request, res: Response) {
    const { id }: any = req.param;
    const user = await User.findById(id);
    return res.send(user);
  }
  public CreateUser(req: Request, res: Response) {}
  public UpdateUser(req: Request, res: Response) {}
  public DeleteUser(req: Request, res: Response) {}

  public routes() {
    this.router.get("/", this.GetUsers);
    this.router.get("/:username", this.GetUser);
    this.router.post("/", this.CreateUser);
    this.router.put("/:username", this.UpdateUser);
    this.router.delete("/:username", this.DeleteUser);
  }
}

const ur = new UserRouter();
ur.routes();

export default ur.router;
