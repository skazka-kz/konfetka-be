import { Document } from "mongoose";

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
};

export interface IImageProps {
  title?: string;
  path?: string;
  width?: number;
  height?: number;
  size?: number;
  originalFileName?: string;
  thumbnailUrl?: string;
  thumbnailSize?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}