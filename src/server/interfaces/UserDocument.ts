import { Document } from "mongoose";

export type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;
export interface IUserDocument extends Document {
  email: string;
  password: string;
  passwordResetToken: string;
  fullName: string;
  nickName: string;
  isAdmin: boolean;
  isEditor: boolean;
  createdAt: Date;
  editedAt: Date;

  comparePassword: comparePasswordFunction;
}
