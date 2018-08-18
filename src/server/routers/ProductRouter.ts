import { Request, Response, Router } from "express";
import * as multer from "multer";
import fileStorage from "../helpers/fileStorage";
import Validator from "../helpers/InputValidator";
import { IImageMetaData, IImageProps } from "../interfaces/ImageDocument";
import { IProductDocument, IProductProps } from "../interfaces/ProductDocument";
import { requireEditorRights } from "../middlewares/requireLogin";
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

class ProductRouter {
  //#region
  // 'Controller' functions

  private static addProduct(
    productProps: IProductProps,
    images?: File[],
    imagesMetadata?: IImageMetaData[]
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        const validate = new Validator();
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
        const validatedImages: IImageMetaData[] = imagesMetadata.map(imd => {
          return {
            title: validate.product.title(imd.title),
            height: validate.isPositiveInteger(imd.height),
            width: validate.isPositiveInteger(imd.width)
          };
        });
        const imageProps: IImageProps[] = images.map((image, index) => {

        });
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
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: "Error: Not a valid ID" });
    }
    try {
      const product = await Product.findById(id)
        .populate("frontImage")
        .populate("images");
      if (!product) {
        return res
          .status(400)
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
      const images = req.files;

      try {
        const created = await ProductRouter.addProduct(
          props,
          images,
          imagesMetadata
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

  private async UpdateProduct(req: Request, res: Response) {}

  private async DeleteProduct(req: Request, res: Response) {}

  private setupRoutes() {
    this.router.get("/", this.GetProducts);
    this.router.get("/:id", this.GetProduct);
    this.router.post(
      "/",
      requireEditorRights,
      upload.array("images", 10),
      this.CreateProduct
    );
    this.router.put("/:id", requireEditorRights, this.UpdateProduct);
    this.router.delete("/:id", requireEditorRights, this.DeleteProduct);
  }
}

const pr = new ProductRouter();
export default pr.router;
