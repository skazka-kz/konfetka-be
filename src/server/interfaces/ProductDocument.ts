import { Document } from "mongoose";
import { IImageProps } from "./ImageDocument";

export type IProductDocument = Document & {
  title: string;
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