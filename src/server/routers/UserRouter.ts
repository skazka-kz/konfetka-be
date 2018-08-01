import { Request, Response, Router } from "express";
import { IUserDocument, IUserProps } from "../interfaces/UserDocument";
import User from "../models/User";

class UserRouter {
  /**
   * Validates and creates a new user, saves to Mongoose
   * @param up IUserProps: object with the values for a new user
   */
  public static registerUser(up: IUserProps): Promise<IUserDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!up.email) {
          reject("Error: No email provided");
        }
        if (!up.password) {
          reject("Error: No password provided");
        }
        if (!UserRouter.validateEmail(up.email)) {
          reject("Error: Invalid email format");
        }

        const newUser = new User(up);
        await newUser.save();
        // Hide password from the response
        newUser.password = undefined;
        resolve(newUser);
      } catch (e) {
        reject(e);
      }
    });
  }

  public static validateEmail(email: string) {
    // tslint:disable-next-line:max-line-length
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regEx.test(String(email).toLowerCase());
  }

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
    const { id }: any = req.params;
    const user = await User.findById(id);
    return res.send(user);
  }
  public async CreateUser(req: Request, res: Response) {
    const { email, password, fullName, nickName }: any = req.body;

    const user = new User({
      email,
      password,
      fullName,
      nickName
    });

    try {
      const createdUser = await UserRouter.registerUser(user);
      return res.send(createdUser);
    } catch (e) {
      return res.status(400).send({ message: e.message });
    }
  }
  public UpdateUser(req: Request, res: Response) {
    res.send({ message: "Coming soon" });
  }
  public DeleteUser(req: Request, res: Response) {
    res.send({ message: "Coming soon" });
  }

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
