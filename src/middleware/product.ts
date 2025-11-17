import { Request, Response, NextFunction } from "express";
import { ProductCategory } from "../types/product";

/**
 * Validation middleware for creating a new product
 */
export const validateProductCreation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, description, price, stock, category, brand, images, tags } = req.body;

  const errors: string[] = [];

  // Required field validations
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Product name is required and must be a non-empty string");
  } else if (name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters long");
  } else if (name.trim().length > 200) {
    errors.push("Product name cannot exceed 200 characters");
  }

  if (!description || typeof description !== "string" || description.trim().length === 0) {
    errors.push("Product description is required and must be a non-empty string");
  } else if (description.trim().length < 10) {
    errors.push("Product description must be at least 10 characters long");
  } else if (description.trim().length > 2000) {
    errors.push("Product description cannot exceed 2000 characters");
  }

  if (price === undefined || price === null) {
    errors.push("Product price is required");
  } else if (typeof price !== "number" || isNaN(price)) {
    errors.push("Product price must be a valid number");
  } else if (price < 0) {
    errors.push("Product price cannot be negative");
  } else if (price > 999999.99) {
    errors.push("Product price cannot exceed 999999.99");
  }

  if (stock === undefined || stock === null) {
    errors.push("Product stock is required");
  } else if (typeof stock !== "number" || !Number.isInteger(stock)) {
    errors.push("Product stock must be a valid integer");
  } else if (stock < 0) {
    errors.push("Product stock cannot be negative");
  }

  if (!category || typeof category !== "string") {
    errors.push("Product category is required and must be a string");
  } else if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
    errors.push(`Invalid product category. Must be one of: ${Object.values(ProductCategory).join(", ")}`);
  }

  // Optional field validations
  if (brand !== undefined && brand !== null) {
    if (typeof brand !== "string") {
      errors.push("Brand must be a string");
    } else if (brand.length > 100) {
      errors.push("Brand name cannot exceed 100 characters");
    }
  }

  if (images !== undefined && images !== null) {
    if (!Array.isArray(images)) {
      errors.push("Images must be an array");
    } else if (images.length > 10) {
      errors.push("Cannot have more than 10 images per product");
    } else {
      for (let i = 0; i < images.length; i++) {
        if (typeof images[i] !== "string") {
          errors.push(`Image at index ${i} must be a string URL`);
          break;
        }
        // Basic URL validation
        if (!isValidURL(images[i])) {
          errors.push(`Image at index ${i} must be a valid URL`);
          break;
        }
      }
    }
  }

  if (tags !== undefined && tags !== null) {
    if (!Array.isArray(tags)) {
      errors.push("Tags must be an array");
    } else if (tags.length > 20) {
      errors.push("Cannot have more than 20 tags per product");
    } else {
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== "string") {
          errors.push(`Tag at index ${i} must be a string`);
          break;
        }
        if (tags[i].length > 50) {
          errors.push(`Tag at index ${i} cannot exceed 50 characters`);
          break;
        }
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
    return;
  }

  // Sanitize and normalize data
  req.body = {
    ...req.body,
    name: name.trim(),
    description: description.trim(),
    category: category.toLowerCase().trim(),
    brand: brand ? brand.trim() : undefined,
    tags: tags ? tags.map((tag: string) => tag.toLowerCase().trim()) : [],
    images: images || [],
    isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
  };

  next();
};

/**
 * Validation middleware for updating a product (UpdateProductRequest)
 */
export const validateProductUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, description, price, stock, category, brand, images, tags, isActive } = req.body;
  const errors: string[] = [];

  // Check if at least one field is provided for update
  if (!name && !description && price === undefined && stock === undefined && 
      !category && !brand && !images && !tags && isActive === undefined) {
    errors.push("At least one field must be provided for update");
  }

  // Validate name field (optional for update)
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      errors.push("Product name must be a non-empty string");
    } else if (name.trim().length < 2) {
      errors.push("Product name must be at least 2 characters long");
    } else if (name.trim().length > 200) {
      errors.push("Product name cannot exceed 200 characters");
    }
  }

  // Validate description field (optional for update)
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length === 0) {
      errors.push("Product description must be a non-empty string");
    } else if (description.trim().length < 10) {
      errors.push("Product description must be at least 10 characters long");
    } else if (description.trim().length > 2000) {
      errors.push("Product description cannot exceed 2000 characters");
    }
  }

  // Validate price field (optional for update)
  if (price !== undefined) {
    if (typeof price !== "number" || isNaN(price)) {
      errors.push("Product price must be a valid number");
    } else if (price < 0) {
      errors.push("Product price cannot be negative");
    } else if (price > 999999.99) {
      errors.push("Product price cannot exceed 999999.99");
    } else {
      // Round to 2 decimal places
      req.body.price = Math.round(price * 100) / 100;
    }
  }

  // Validate stock field (optional for update)
  if (stock !== undefined) {
    if (typeof stock !== "number" || !Number.isInteger(stock)) {
      errors.push("Product stock must be a valid integer");
    } else if (stock < 0) {
      errors.push("Product stock cannot be negative");
    }
  }

  // Validate category field (optional for update)
  if (category !== undefined) {
    if (typeof category !== "string" || category.trim().length === 0) {
      errors.push("Product category must be a non-empty string");
    } else if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
      errors.push(`Invalid product category. Must be one of: ${Object.values(ProductCategory).join(", ")}`);
    }
  }

  // Validate brand field (optional for update)
  if (brand !== undefined) {
    if (brand !== null && typeof brand !== "string") {
      errors.push("Brand must be a string or null");
    } else if (brand && brand.length > 100) {
      errors.push("Brand name cannot exceed 100 characters");
    }
  }

  // Validate images field (optional for update)
  if (images !== undefined) {
    if (!Array.isArray(images)) {
      errors.push("Images must be an array");
    } else if (images.length > 10) {
      errors.push("Cannot have more than 10 images per product");
    } else {
      for (let i = 0; i < images.length; i++) {
        if (typeof images[i] !== "string") {
          errors.push(`Image at index ${i} must be a string URL`);
          break;
        }
        if (!isValidURL(images[i])) {
          errors.push(`Image at index ${i} must be a valid URL`);
          break;
        }
      }
    }
  }

  // Validate tags field (optional for update)
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push("Tags must be an array");
    } else if (tags.length > 20) {
      errors.push("Cannot have more than 20 tags per product");
    } else {
      for (let i = 0; i < tags.length; i++) {
        if (typeof tags[i] !== "string") {
          errors.push(`Tag at index ${i} must be a string`);
          break;
        }
        if (tags[i].length > 50) {
          errors.push(`Tag at index ${i} cannot exceed 50 characters`);
          break;
        }
      }
    }
  }

  // Validate isActive field (optional for update)
  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.push("isActive must be a boolean value");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
    return;
  }

  // Sanitize and normalize provided data only
  const sanitizedData: any = {};
  
  if (name !== undefined) sanitizedData.name = name.trim();
  if (description !== undefined) sanitizedData.description = description.trim();
  if (price !== undefined) sanitizedData.price = req.body.price; // Already rounded above
  if (stock !== undefined) sanitizedData.stock = stock;
  if (category !== undefined) sanitizedData.category = category.toLowerCase().trim();
  if (brand !== undefined) sanitizedData.brand = brand ? brand.trim() : null;
  if (images !== undefined) sanitizedData.images = images;
  if (tags !== undefined) sanitizedData.tags = tags.map((tag: string) => tag.toLowerCase().trim());
  if (isActive !== undefined) sanitizedData.isActive = Boolean(isActive);

  req.body = sanitizedData;
  next();
};

/**
 * Validation middleware for product ID parameter
 */
export const validateProductId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
    return;
  }

  // // Basic MongoDB ObjectId validation
  // if (!isValidObjectId(id)) {
  //   res.status(400).json({
  //     success: false,
  //     message: "Invalid product ID format. Must be a valid ObjectId",
  //   });
  //   return;
  // }

  next();
};


export const isValidQuery = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  // Basic validation: allow alphanumeric, spaces, hyphens, and underscores
   

  const { query } = req.query;

  if (!query || typeof query !== "string") {
    errors.push("Invalid search query");
  } 
  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }
    next();
}
/**
 * Helper function to validate URL format
 */
function isValidURL(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    // Also allow relative URLs or simple paths
    const relativeUrlPattern = /^(\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?$/;
    return relativeUrlPattern.test(string) || string.startsWith('data:image/');
  }
}

/**
 * Helper function to validate MongoDB ObjectId format
 */
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
