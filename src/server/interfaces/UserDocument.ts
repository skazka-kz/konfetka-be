import {Document, Schema} from "mongoose";

export type IUserDocument = Document & {
  id: string;
  email: string;
  password: string;
  passwordResetToken: string;
  fullName: string;
  nickName: string;
  isAdmin: boolean;
  isEditor: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword: comparePasswordFunction;
};

export interface IUserProps {
  email: string;
  fullName?: string;
  nickName?: string;
  password: string;
}

export interface IUserUpdateProps {
  email?: string;
  fullName?: string;
  nickName?: string;
}

export type comparePasswordFunction = (candidatePassword: string) => Promise<boolean>;
