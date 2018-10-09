import { model, Schema } from "mongoose";

import { IProductCategoryDocument } from "../interfaces/ProductCategoryDocument";

const ProductCategorySchema: Schema = new Schema({
  title: {
    type: String,
    required: true
  },
  category: [{
    type: Schema.Types.ObjectId,
    ref: "Product"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

export default model<IProductCategoryDocument>("ProductCategory", ProductCategorySchema);
