import { Document } from "mongoose";

export type IImageDocument = Document & {
  title: string;
  path: string;
  width: number;
  height: number;
  size: number;
  originalFileName: string;
  thumbnail: Document & IImageDocument;
  createdAt: Date;
  updatedAt: Date;
};

export interface IImageProps {
  title?: string;
  path?: string;
  width?: number;
  height?: number;
  size?: number;
  originalFileName?: string;
  thumbnail?: IImageProps;
}

export interface IImageMetaData {
  title?: string;
  width?: number;
  height?: number;
  size?: number;
}
