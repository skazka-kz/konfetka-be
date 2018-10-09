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

  public mongoId(id: string): boolean {
    return !!(id.match(/^[0-9a-fA-F]{24}$/));
  }
}

export default InputValidator;
