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
  thumbnailUrl: String,
  thumbnailSize: Number,
  thumbnailWidth: Number,
  thumbnailHeight: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

export default model<IImageDocument>("Image", ImageSchema);
