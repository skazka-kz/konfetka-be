import { Document } from "mongoose";

export type IProductDocument = Document & {
  title: string;
  // TODO: Change to the category type
  category?: string;
  description?: string;
  weight?: string;
  price?: string;
  frontImage?: string;
  images?: [string];
  createdAt?: Date;
  editedAt?: Date;

};

export interface IProductProps {
  title?: string;
  description?: string;
  weight?: string;
  price?: string;
  category?: string;
  frontImage?: string;
  images?: [string];
}