import { Document } from "mongoose";
import { IImageDocument, IImageProps } from "./ImageDocument";

export type IProductDocument = Document & {
  title: string;
  category?: string;
  description?: string;
  weight?: string;
  price?: string;
  frontImage?: IImageDocument;
  images?: [IImageDocument];
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IProductProps {
  title?: string;
  description?: string;
  weight?: string;
  price?: string;
  category?: string;
  frontImage?: IImageProps;
  images?: [IImageProps];
}
