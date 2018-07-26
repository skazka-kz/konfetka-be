import * as bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";

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
  createdAt: Date,
  updatedAt: Date
});

// Not using fat arrow notation to preserve 'this'
UserSchema.pre("save", async function save(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default model("User", UserSchema);
