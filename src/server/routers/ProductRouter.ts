import { Request, Response, Router } from "express";
import * as multer from "multer";
import keys from "../../../config/keys";
import Validator from "../helpers/InputValidator";
import { IImageMetaData, IImageProps } from "../interfaces/ImageDocument";
import { IProductDocument, IProductProps } from "../interfaces/ProductDocument";
import {
  requireAdminRights,
  requireEditorRights,
  requireLogin
} from "../middlewares/requireLogin";
import Product from "../models/Product";
import {Validator} from "react";

const upload = multer({ dest: keys.fileStorageFolder });

class ProductRouter {
  //#region
  // 'Controller' functions

  private static addProduct(
    productProps: IProductProps,
    images?: IImageProps[],
    imagesMetadata?: IImageMetaData[]
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      try {
        // Start by validating the input data
        let validatedProps: IProductProps = {
          title: Validator.validateTitle(productProps.title),
          price: Validator.validatePrice(productProps.price),
          description: Validator.validateDescription(productProps.description),
          weight: Validator.validateWeight(productProps.weight)
        };
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
      const filesMetadata: IImageMetaData = JSON.parse(req.body.filesMetadata);
      const files = req.body.files;

      try {
        const createdProduct = new Product(props);
        await createdProduct.save();
        return res.send(createdProduct);
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
    this.router.post("/", requireEditorRights, this.CreateProduct);
    this.router.put("/:id", requireEditorRights, this.UpdateProduct);
    this.router.delete("/:id", requireEditorRights, this.DeleteProduct);
  }
}

const pr = new ProductRouter();
export default pr.router;
