class InputValidator {
  public static validateTitle(title: string): string {
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

  public static validatePrice(price: number): number {
    if (!price) {
      throw new Error("Error: Price is required");
    }
    if (!Number.isInteger(price)) {
      throw new Error("Error: Price not a whole number");
    }
    if (price < 0) {
      throw new Error("Error: Price cannot be negative");
    }
    return price;
  }

  public static validateDescription(description: string): string {
    if (!description) {
      return "";
    }
    if (description.length > 3000) {
      throw new Error("Error: Description too long. 3000 characters max");
    }
    return description.trim();
  }

  public static validateWeight(weight: string): string {
    if (!weight) {
      return "";
    }
    if (weight.length > 50) {
      throw new Error("Error: Weight too long, 50 characters max");
    }
    return weight.trim();
  }
}

export default InputValidator;
