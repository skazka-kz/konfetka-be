import { Request, Response, Router } from "express";
import * as multer from "multer";
import fileStorage from "../helpers/fileStorage";
import Validator from "../helpers/InputValidator";
import {
  IImageDocument,
  IImageMetaData,
  IImageProps
} from "../interfaces/ImageDocument";
import { IProductDocument, IProductProps } from "../interfaces/ProductDocument";
import { requireEditorRights } from "../middlewares/requireLogin";
import Image from "../models/Image";
import Product from "../models/Product";

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 1500000 },
  fileFilter: (req, file, cb) => {
    // Check for extension and mime type
    const fileTypes = /jpeg|jpg|png|gif/;
    // Check the mime type
    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType) {
      return cb(null, true);
    } else {
      return cb(
        new Error(`Error: incorrect file type. Only images can be uploaded`),
        false
      );
    }
  }
});

const validate = new Validator();

class ProductRouter {
  //#region
  // 'Controller' functions

  private static addProduct(
    productProps: IProductProps,
    images?: Express.Multer.File[],
    imagesMetadata?: IImageMetaData[],
    thumbs?: Express.Multer.File[],
    thumbsMetadata?: IImageMetaData[]
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        // Start by validating the input data
        const validatedProps: IProductProps = {
          title: validate.product.title(productProps.title),
          price: validate.isPositiveInteger(productProps.price),
          description: validate.product.description(productProps.description),
          weight: validate.product.weight(productProps.weight)
        };

        validatedProps.category = await validate.product.category(
          productProps.category
        );

        const product = new Product(validatedProps);
        // Save all promises to an array to Promise.all() later
        const promises = [];
        promises.push(product.save());
        // If there are images, validate and add
        if (
          Array.isArray(images) &&
          Array.isArray(imagesMetadata) &&
          Array.isArray(thumbs) &&
          Array.isArray(thumbsMetadata)
        ) {
          product.images = [];
          // Gather and validate image data, thumbnails, then gather in two arrays, thumbnail array and image array
          const thumbsProps: IImageProps[] = thumbs.map((thumb, index) => ({
            title: validate.product.title(thumbsMetadata[index].title),
            path: thumb.path,
            size: thumb.size,
            height: validate.isPositiveInteger(thumbsMetadata[index].height),
            width: validate.isPositiveInteger(thumbsMetadata[index].width),
            originalFileName: thumb.filename
          }));

          const imageProps: IImageProps[] = images.map((image, index) => ({
            title: validate.product.title(imagesMetadata[index].title),
            path: image.path,
            size: image.size,
            height: validate.isPositiveInteger(imagesMetadata[index].height),
            width: validate.isPositiveInteger(imagesMetadata[index].width),
            originalFileName: image.filename,
            thumbnail: thumbsProps[index]
          }));

          // Now create the mongoose objects
          if (thumbsProps.length !== imageProps.length) {
            reject("Error: Number of images and thumbnails mismatch");
          }

          imageProps.forEach((props, index) => {
            const image = new Image(props);
            const thumbnail = new Image(thumbsProps[index]);
            image.thumbnail = thumbnail;
            if (!product.frontImage) {
              product.frontImage = image;
            } else {
              product.images.push(image);
            }
            promises.push(thumbnail.save());
            promises.push(image.save());
          });
        }
        await Promise.all(promises);

        resolve(product);
      } catch (e) {
        reject(e);
      }
    });
  }

  // Very similar to the above method. Can refactor at some point
  private static addImagesToProduct(
    productId: string,
    images?: Express.Multer.File[],
    imagesMetadata?: IImageMetaData[],
    thumbs?: Express.Multer.File[],
    thumbsMetadata?: IImageMetaData[]
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      if (!validate.mongoId(productId)) {
        reject("Error: Not a valid ID");
      }

      const product = await Product.findById(productId);
      const promises = [];
      if (
        Array.isArray(images) &&
        Array.isArray(imagesMetadata) &&
        Array.isArray(thumbs) &&
        Array.isArray(thumbsMetadata)
      ) {
        // Gather and validate image data, thumbnails, then gather in two arrays, thumbnail array and image array
        const thumbsProps: IImageProps[] = thumbs.map((thumb, index) => ({
          title: validate.product.title(thumbsMetadata[index].title),
          path: thumb.path,
          size: thumb.size,
          height: validate.isPositiveInteger(thumbsMetadata[index].height),
          width: validate.isPositiveInteger(thumbsMetadata[index].width),
          originalFileName: thumb.filename
        }));

        const imageProps: IImageProps[] = images.map((image, index) => ({
          title: validate.product.title(imagesMetadata[index].title),
          path: image.path,
          size: image.size,
          height: validate.isPositiveInteger(imagesMetadata[index].height),
          width: validate.isPositiveInteger(imagesMetadata[index].width),
          originalFileName: image.filename,
          thumbnail: thumbsProps[index]
        }));

        // Now create the mongoose objects
        if (thumbsProps.length !== imageProps.length) {
          reject("Error: Number of images and thumbnails mismatch");
        }

        imageProps.forEach((props, index) => {
          const image = new Image(props);
          const thumbnail = new Image(thumbsProps[index]);
          image.thumbnail = thumbnail;
          // If no front image yet, make the first one the front image
          if (!product.frontImage) {
            product.frontImage = image;
          } else {
            product.images.push(image);
          }
          promises.push(thumbnail.save());
          promises.push(image.save());
        });

        await Promise.all(promises);
        resolve(product);
      } else {
        reject("Error: Number of images and thumbnails mismatch");
      }
    });
  }

  private static editProduct(
    id: string,
    productProps: IProductProps
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        const loaded = await Product.findById(validate.product.id(id));
        if (!loaded) {
          reject("Error: No product with such ID found or invalid ID");
        }
        // Make sure props passed are safe
        const validatedProps: IProductProps = {
          // Check title was passed since validator throws an error with empty title
          title: productProps.title
            ? validate.product.title(productProps.title)
            : "",
          description: validate.product.description(productProps.description),
          weight: validate.product.weight(productProps.weight),
          price: validate.isPositiveInteger(productProps.price),
          category: await validate.product.category(productProps.category)
        };
        // Only change non-empty values, I'm sure there's an easier way of doing this
        if (validatedProps.title) {
          loaded.title = validatedProps.title;
        }
        if (validatedProps.description) {
          loaded.description = validatedProps.description;
        }
        if (validatedProps.weight) {
          loaded.weight = validatedProps.weight;
        }
        if (validatedProps.price) {
          loaded.price = validatedProps.price;
        }
        if (validatedProps.category) {
          loaded.category = validatedProps.category;
        }

        await loaded.save();
        resolve(loaded);
      } catch (e) {
        reject(e);
      }
    });
  }
  //#endregion
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private async GetProducts(req: Request, res: Response) {
    // TODO: add support for filtering, sorting and pagination
    const all = await Product.find({}).populate("frontImage");
    return res.send(all);
  }

  private async GetProduct(req: Request, res: Response) {
    const id: string = req.params.id;
    if (!validate.mongoId(id)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const product = await Product.findById(id)
        .populate("frontImage")
        .populate("images");
      if (!product) {
        return res
          .status(404)
          .send({ message: "Error: No product with such ID found" });
      }
      return res.send(product);
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private async CreateProduct(req: Request, res: Response) {
    try {
      const props: IProductProps = JSON.parse(req.body.product);
      const imagesMetadata: IImageMetaData[] = JSON.parse(
        req.body.imagesMetadata
      );
      const thumbsMetadata: IImageMetaData[] = JSON.parse(
        req.body.thumbsMetadata
      );

      // ignoring, special case
      // @ts-ignore
      const images: Express.Multer.File[] = req.files.images;
      // @ts-ignore
      const thumbs: Express.Multer.File[] = req.files.thumbs;

      try {
        const created = await ProductRouter.addProduct(
          props,
          images,
          imagesMetadata,
          thumbs,
          thumbsMetadata
        );
        return res.send(created);
      } catch (e) {
        return res.status(400).send({ message: e.message ? e.message : e });
      }
    } catch (e) {
      // JSON parse error
      return res
        .status(400)
        .send({ message: "Error: Error parsing product info" });
    }
  }

  private async UpdateProduct(req: Request, res: Response) {
    const id: string = req.params.id;
    if (!validate.mongoId(id)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const updated = await ProductRouter.editProduct(id, req.body);
      return res.send(updated);
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private async DeleteProduct(req: Request, res: Response) {
    const id: string = req.params.id;
    if (!validate.mongoId(id)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const product = Product.findById(id);
      if (!product) {
        return res
          .status(404)
          .send({ message: "Error: No product with such ID" });
      }
      await Product.findByIdAndRemove(id);
      return res.send({ message: "Product deleted successfully" });
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private async GetAllProductImages(req: Request, res: Response) {
    const id: string = req.params.id;
    const imageId: string = req.params.imageId;
    if (!validate.mongoId(id) || !validate.mongoId(imageId)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const product = await Product.findById(id)
        .populate("frontImage")
        .populate("images");
      if (!product) {
        return res
          .status(404)
          .send({ message: "Error: No product with such ID" });
      }
      if (!product.images.length) {
        return res
          .status(404)
          .send({ message: "No images found for this product" });
      }
      const images = product.images;
      images.unshift(product.frontImage);
      return res.send(images);
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private async GetProductImage(req: Request, res: Response) {
    const id: string = req.params.id;
    if (!validate.mongoId(id)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const image = await Image.findById(id);
      if (!image) {
        return res
          .status(404)
          .send({ message: "Error: No image found with such ID" });
      }
      return res.send(image);
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private async AddProductImages(req: Request, res: Response) {
    const id: string = req.params.id;
    // ignoring, special case
    // @ts-ignore
    const images: Express.Multer.File[] = req.files.images;
    // @ts-ignore
    const thumbs: Express.Multer.File[] = req.files.thumbs;

    const imagesMetadata: IImageMetaData[] = JSON.parse(
      req.body.imagesMetadata
    );
    const thumbsMetadata: IImageMetaData[] = JSON.parse(
      req.body.thumbsMetadata
    );

    try {
      const updated = await ProductRouter.addImagesToProduct(
        id,
        images,
        imagesMetadata,
        thumbs,
        thumbsMetadata
      );
      return res.send(updated);
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }
  private async DeleteProductImage(req: Request, res: Response) {
    const id: string = req.params.id;
    if (!validate.mongoId(id)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const image = Image.findById(id);
      if (!image) {
        return res
          .status(404)
          .send({ message: "Error: No image with such ID" });
      }
      await Image.findByIdAndRemove(id);
      return res.send({ message: "Image deleted successfully" });
    } catch (e) {
      return res.status(400).send({
        message: e.message ? e.message : e
      });
    }
  }

  private setupRoutes() {
    this.router.get("/", this.GetProducts);
    this.router.get("/:id", this.GetProduct);
    this.router.post(
      "/",
      requireEditorRights,
      upload.fields([
        { name: "images", maxCount: 10 },
        { name: "thumbs", maxCount: 10 }
      ]),
      this.CreateProduct
    );
    this.router.put("/:id", requireEditorRights, this.UpdateProduct);
    this.router.delete("/:id", requireEditorRights, this.DeleteProduct);

    // Product Images routes
    this.router.get("/:id/images", this.GetAllProductImages);
    this.router.get("/images/:id", this.GetProductImage);
    this.router.post(
      "/:id/images",
      requireEditorRights,
      upload.fields([
        { name: "images", maxCount: 10 },
        { name: "thumbs", maxCount: 10 }
      ]),
      this.AddProductImages
    );
    this.router.delete("/:id/images/:imageId", this.DeleteProductImage);
  }
}

const pr = new ProductRouter();
export default pr.router;
