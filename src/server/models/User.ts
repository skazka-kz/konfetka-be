import * as bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";

import IUserDocument from "../interfaces/UserDocument";

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    select: false
  },
  fullName: String,
  nickName: String,
  isAdmin: {
    type: Boolean,
    default: false
  },
  isEditor: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Not using fat arrow notation to preserve 'this' scope
UserSchema.pre("save", async function save(next) {
  const user = this as IUserDocument;
  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

export default model<IUserDocument>("User", UserSchema);
