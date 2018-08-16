import { model, Schema } from "mongoose";
import { IImageDocument } from "../interfaces/ImageDocument";

const ImageSchema: Schema = new Schema({
  title: {
    type: String,
    required: true
  },
  path: String,
  width: Number,
  height: Number,
  size: Number,
  originalFileName: String,
  thumbnail: {
    path: String,
    size: Number,
    width: Number,
    height: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

ImageSchema.pre("save", async function save(next) {
  const product = this as IImageDocument;
  product.updatedAt = new Date();
  next();
});

export default model<IImageDocument>("Image", ImageSchema);
