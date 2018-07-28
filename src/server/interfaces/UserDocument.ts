import { Document } from "mongoose";

export type IUserDocument = Document & {
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
};

export type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;
