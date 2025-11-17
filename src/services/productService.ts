import Product from "../models/Product";
import {
  IProduct,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product";
import { Types } from "mongoose";

/**
 * Product Service - Business logic for product operations
 */
class ProductServiceClass {
  /**
   * Create a new product
   */

  async searchProducts(
    searchQuery: any,
    limit: number = 30,
    sortOrder: 1 | -1 = -1
  ): Promise<IProduct[]> {
    try {
      const products = await Product.find(searchQuery)
        .sort({ createdAt: sortOrder })
        .limit(limit);
      return products;
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }
  }

  /**
   * Get all products with pagination
   */
  async getAllProducts(
    query: any = {},
    limit: number = 30,
    sortOrder: 1 | -1 = -1
  ): Promise<IProduct[]> {
    try {
      const products = await Product.find(query)
        .sort({ createdAt: sortOrder })
        .limit(limit);
      return products;
    } catch (error) {
      console.error("Error fetching all products:", error);
      throw new Error("Failed to fetch products");
    }
  }
  async createProduct(productData: CreateProductRequest): Promise<IProduct> {
    try {
      const product = new Product({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        category: productData.category,
        brand: productData.brand,
        images: productData.images || [],
        tags: productData.tags || [],
        isActive:
          productData.isActive !== undefined ? productData.isActive : true,
      });

      const savedProduct = await product.save();
      return savedProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create product");
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<IProduct | null> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID format");
      }

      const product = await Product.findById(productId);
      return product;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch product");
    }
  }

  /**
   * Get low stock products (for inventory alerts)
   */
  async getLowStockProducts(threshold: number = 10): Promise<IProduct[]> {
    try {
      return await Product.find({
        stock: { $lte: threshold, $gt: 0 },
        isActive: true
      }).sort({ stock: 1 }).limit(50);
    } catch (error) {
      console.error("Get low stock products error:", error);
      throw new Error("Failed to fetch low stock products");
    }
  }

  /**
   * Update product by ID
   */
  async updateProduct(
    productId: string,
    updateData: UpdateProductRequest
  ): Promise<IProduct | null> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID format");
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        {
          new: true, // Return updated document
          runValidators: true, // Run schema validators
        }
      );

      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update product");
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(productId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product ID format");
      }

      const deletedProduct = await Product.findByIdAndDelete(productId);
      return deletedProduct !== null;
    } catch (error) {
      console.error("Error deleting product:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete product");
    }
  }

  /**
   * Check if product exists
   */
  async productExists(productId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        return false;
      }

      const exists = await Product.exists({ _id: productId });
      return exists !== null;
    } catch (error) {
      console.error("Error checking product existence:", error);
      return false;
    }
  }
}

// Export singleton instance
export const ProductService = new ProductServiceClass();

export default ProductService;
