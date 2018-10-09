import { Document } from "mongoose";

export type IProductCategoryDocument = Document & {
  title: string;
  // TODO: Change to the category type
  products?: [object]
};

export interface IProductCategoryProps {
  title: string;
}