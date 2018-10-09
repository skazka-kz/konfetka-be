import { model, Schema } from "mongoose";

import { IProductDocument } from "../interfaces/ProductDocument";

const ProductSchema: Schema = new Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "ProductCategory"
  },
  description: String,
  weight: String,
  price: Number,
  frontImage: {
    type: Schema.Types.ObjectId,
    ref: "Image"
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "Image"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

ProductSchema.pre("save", async function save(next) {
  const product = this as IProductDocument;
  product.updatedAt = new Date();
  next();
});

export default model<IProductDocument>("Product", ProductSchema);
