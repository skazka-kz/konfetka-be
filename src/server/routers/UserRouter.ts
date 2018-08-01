import { Request, Response, Router } from "express";
import {
  IUserDocument,
  IUserProps,
  IUserUpdateProps
} from "../interfaces/UserDocument";
import User from "../models/User";

class UserRouter {
  public static deleteUser(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          reject("Error: User with such ID does not exist");
        }
        await User.findByIdAndRemove(id);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }
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

  public static updateUser(
    id: string,
    up: IUserUpdateProps
  ): Promise<IUserDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!id) {
          reject("Error: No user ID specified");
        }
        if (up.email && !UserRouter.validateEmail(up.email)) {
          reject("Error: Invalid email format");
        }

        // Filtering out, in case there are rogue values like password
        const updatedValues: IUserUpdateProps = {
          email: up.email,
          fullName: up.fullName,
          nickName: up.nickName
        };

        await User.findByIdAndUpdate(id, updatedValues);
        const updatedUser = await User.findById(id);
        resolve(updatedUser);
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
    if (!user) {
      return res
        .status(400)
        .send({ message: "Error: User with such ID does not exist" });
    }
    return res.send(user);
  }
  public async CreateUser(req: Request, res: Response) {
    const { email, password, fullName, nickName }: IUserProps = req.body;

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
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }
  public async UpdateUser(req: Request, res: Response) {
    const { email, nickName, fullName }: IUserUpdateProps = req.body;
    const { id } = req.params;

    try {
      const result = await UserRouter.updateUser(id, {
        email,
        nickName,
        fullName
      });
      res.send(result);
    } catch (e) {
      res.status(400).send({ message: "Error retrieving user data" });
    }
  }
  public async DeleteUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const isSuccess = await UserRouter.deleteUser(id);
      return res.send({ message: "User successfully deleted" });
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  public routes() {
    this.router.get("/", this.GetUsers);
    this.router.get("/:id", this.GetUser);
    this.router.post("/", this.CreateUser);
    this.router.put("/:id", this.UpdateUser);
    this.router.delete("/:id", this.DeleteUser);
  }
}

const ur = new UserRouter();
ur.routes();

export default ur.router;
