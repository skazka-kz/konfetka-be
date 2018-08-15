import { Request, Response, Router } from "express";
import { IProductDocument, IProductProps } from "../interfaces/ProductDocument";
import {
  requireAdminRights,
  requireEditorRights,
  requireLogin
} from "../middlewares/requireLogin";
import Product from "../models/Product";

class ProductRouter {
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
  }

  private async CreateProduct(req: Request, res: Response) {}

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
