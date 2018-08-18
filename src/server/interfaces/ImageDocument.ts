import { Document, Schema } from "mongoose";

export type IImageDocument = Document & {
  title: string;
  path: string;
  width: number;
  height: number;
  size: number;
  originalFileName: string;
  thumbnailUrl: string;
  thumbnailSize: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface IImageProps {
  title: string;
  path: string;
  width?: number;
  height?: number;
  size?: number;
  originalFileName?: string;
  thumbnail: IImageProps;
}

export interface IImageMetaData {
  title?: string;
  width?: number;
  height?: number;
  size?: number;
}
