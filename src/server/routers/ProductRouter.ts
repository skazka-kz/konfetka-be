import { Request, Response, Router } from "express";
import { IImageMetaData, IImageProps } from "../interfaces/ImageDocument";
import { IProductDocument, IProductProps } from "../interfaces/ProductDocument";
import {
  requireAdminRights,
  requireEditorRights,
  requireLogin
} from "../middlewares/requireLogin";
import Product from "../models/Product";

class ProductRouter {
  //#region
  // 'Controller' functions

  private static addProduct(
    productProps: IProductProps,
    images?: [IImageProps],
    imagesMetadata?: [IImageMetaData]
  ): Promise<IProductDocument> {
    return new Promise(async (resolve, reject) => {
      try {
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
    const all = await Product.find({});
    return res.send(all);
  }

  private async GetProduct(req: Request, res: Response) {
    const { id }: any = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(400)
        .send({ message: "Error: No product with such ID found" });
    }
    return res.send(product);
  }

  private async CreateProduct(req: Request, res: Response) {
    try {
      const {
        category,
        description,
        price,
        title,
        weight
      }: IProductProps = JSON.parse(req.body.product);

      const filesMetadata = req.body.filesMetadata;
      const files = req.body.files;

      try {
        const createdProduct = new Product();
      } catch (e) {
        return res.status(400).send({ message: e.message ? e.message : e });
      }
    } catch (e) {
      // JSON parse error
      return res
        .status(400)
        .send({ message: "Error: error parsing Product info" });
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
