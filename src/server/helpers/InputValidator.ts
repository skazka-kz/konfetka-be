import { IProductCategoryDocument } from "../interfaces/ProductCategoryDocument";
import ProductCategory from "../models/ProductCategory";
import ProductValidator from "./ProductValidator";

class InputValidator {
  public product: ProductValidator;

  constructor() {
    this.product = new ProductValidator();
  }

  public isPositiveInteger(num: number) {
    if (!num) {
      throw new Error("Error: Price is required");
    }
    if (!Number.isInteger(num)) {
      throw new Error("Error: Price not a whole number");
    }
    if (num < 0) {
      throw new Error("Error: Price cannot be negative");
    }
    return num;
  }
}

export default InputValidator;
