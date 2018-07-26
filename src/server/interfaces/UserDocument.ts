import { Document } from "mongoose";

export default interface IUserDocument extends Document {
  email: string;
  password: string;
  fullName: string;
  nickName: string;
  isAdmin: boolean;
  isEditor: boolean;
  createdAt: Date;
  editedAt: Date;
}
