import ProductCategory from "../models/ProductCategory";

class ProductValidator {
  public id(id: string): string {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Error: Invalid ID");
    }
    return id;
  }

  public title(title: string): string {
    if (!title) {
      throw new Error("Error: Title is required.");
    }
    if (title.trim().length > 60) {
      throw new Error(
        "Error: Title too long. Max number of characters allowed is 60."
      );
    }
    return title.trim();
  }

  public description(description: string): string {
    if (!description) {
      return "";
    }
    if (description.length > 3000) {
      throw new Error("Error: Description too long. 3000 characters max");
    }
    return description.trim();
  }

  public weight(weight: string): string {
    if (!weight) {
      return "";
    }
    if (weight.length > 50) {
      throw new Error("Error: Weight too long, 50 characters max");
    }
    return weight.trim();
  }

  public async category(categoryId: string): Promise<string> {
    if (!categoryId) {
      return null;
    }
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Error: Invalid category ID");
    }
    const loaded = await ProductCategory.findById(categoryId);
    if (!loaded) {
      throw new Error("Error: Category not found");
    }
    return categoryId.trim();
  }
}

export default ProductValidator;
