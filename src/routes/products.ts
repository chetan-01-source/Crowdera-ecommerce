import { Router, Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { ProductService } from "../services/productService";
import { CreateProductRequest, UpdateProductRequest, IProduct } from "../types/product";
import { validateProductCreation,validateProductUpdate,validateProductId,isValidQuery } from "../middleware/product";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);



router.get("/", async (req: Request, res: Response) => {
  try {
     const { cursor, limit = '30', sortOrder = 'desc' } = req.query;
      const parsedLimit = Math.min(parseInt(limit as string) || 30, 100); // Max 100 users per request
    const sort = sortOrder === 'asc' ? 1 : -1;
    
    // Build query
    const query: any = {};
    
    // Add cursor condition for pagination
    if (cursor && typeof cursor === 'string') {
      try {
        query._id = sort === -1 ? { $lt: cursor } : { $gt: cursor };
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid cursor format",
        });
        return;
      }
    }
    const products: IProduct[] = await ProductService.getAllProducts(query, parsedLimit + 1, sort);

    const hasMore = products.length > parsedLimit;
    const productList = hasMore ? products.slice(0, parsedLimit) : products;
    
    const nextCursor = productList.length > 0 ? (productList[productList.length - 1] as any)._id.toString() : null;

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: { 
        products: productList.map(product => ({
          id: (product as any)._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          brand: product.brand,
          images: product.images,
          tags: product.tags,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })), 
        count: productList.length,
        pagination: {
          hasMore,
          nextCursor: hasMore ? nextCursor : null,
          limit: parsedLimit,
          sortOrder
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve products",
    });
  }
});

/**
 * POST /products - Create a new product (Admin only)
 */
router.post("/", requireAdmin,validateProductCreation, async (req: Request, res: Response) => {
  try {
    const productData: CreateProductRequest = req.body;

    // Basic validation
    if (!productData.name || !productData.description || !productData.price || productData.stock === undefined || !productData.category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, description, price, stock, category",
      });
    }

    // Validate price and stock
    if (productData.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (productData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const product = await ProductService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        id: (product as any)._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        brand: product.brand,
        images: product.images,
        tags: product.tags,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create product",
    });
  }
});
router.get('/search', isValidQuery, async (req: Request, res: Response) => {
    const { cursor, limit = '30', sortOrder = 'desc' } = req.query;
          const parsedLimit = Math.min(parseInt(limit as string) || 30, 100); // Max 100 users per request
    const sort = sortOrder === 'asc' ? 1 : -1;
  const { query } = req.query;

  if(!query || typeof query !== "string") {
      return res.status(400).json({
      success: false,
      message: "Invalid search query",
    });
  }
  const searchQuery :any = { $text: { $search: query.trim() } };
  if (cursor && typeof cursor === 'string') {
      try {
        searchQuery._id = sort === -1 ? { $lt: cursor } : { $gt: cursor };
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Invalid cursor format",
        });
        return;
      }
    }

  

  try {
    // const products = await ProductService.searchProducts(searchQuery, parsedLimit + 1, sort);
    const products: IProduct[] = await ProductService.searchProducts(searchQuery, parsedLimit + 1, sort);

    const hasMore = products.length > parsedLimit;
    const productList = hasMore ? products.slice(0, parsedLimit) : products;
    
    const nextCursor = productList.length > 0 ? (productList[productList.length - 1] as any)._id.toString() : null;

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: { 
        products: productList.map(product => ({
          id: (product as any)._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          brand: product.brand,
          images: product.images,
          tags: product.tags,
          isActive: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })), 
        count: productList.length,
        pagination: {
          hasMore,
          nextCursor: hasMore ? nextCursor : null,
          limit: parsedLimit,
          sortOrder
        }
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve products",
    });
  }
});

/**
 * GET /products/:id - Get product by ID (Authenticated users)
 */
router.get("/:id", validateProductId,async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await ProductService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Return product data
    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: {
        id: (product as any)._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        brand: product.brand,
        images: product.images,
        tags: product.tags,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve product",
    });
  }
});

/**
 * PUT /products/:id - Update product by ID (Admin only)
 */
router.put("/:id", requireAdmin, validateProductUpdate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateProductRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate numeric fields if provided
    if (updateData.price !== undefined && updateData.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }

    if (updateData.stock !== undefined && updateData.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative",
      });
    }

    const updatedProduct = await ProductService.updateProduct(id, updateData);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        id: (updatedProduct as any)._id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        category: updatedProduct.category,
        brand: updatedProduct.brand,
        images: updatedProduct.images,
        tags: updatedProduct.tags,
        isActive: updatedProduct.isActive,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update product",
    });
  }
});

/**
 * PATCH /products/:id/stock - Update product stock (Admin only)
 */
router.patch("/:id/stock", validateProductId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operation, quantity } = req.body;

    // Validate request body
    if (!operation || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Operation and quantity are required",
        errors: ["operation field is required (add/subtract)", "quantity field is required"]
      });
    }

    if (!['add', 'subtract'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: "Invalid operation",
        errors: ["operation must be either 'add' or 'subtract'"]
      });
    }

    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
        errors: ["quantity must be a positive integer"]
      });
    }

 

    // Get current product
    const product = await ProductService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Calculate new stock based on operation
    let newStock: number;
    if (operation === 'add') {
      newStock = product.stock + quantity;
    } else {
      newStock = product.stock - quantity;
      
      // Prevent negative stock
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
          errors: [`Stock is insufficient. Current stock: ${product.stock}, requested quantity: ${quantity}`],
          data: {
            currentStock: product.stock,
            requestedQuantity: quantity,
            shortfall: Math.abs(newStock)
          }
        });
      }
    }

    // Update product stock
    const updatedProduct = await ProductService.updateProduct(id, { stock: newStock });

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        message: "Failed to update product stock"
      });
    }

    // Log the stock change for audit purposes
    console.log(`Stock Update - Product: ${product.name} (${id}) | Operation: ${operation} | Quantity: ${quantity} | Previous: ${product.stock} | New: ${newStock}} | Admin: ${(req.user as any)?.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: `Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully`,
      data: {
        productId: id,
        productName: product.name,
        operation: operation,
        quantity: quantity,
        previousStock: product.stock,
        newStock: newStock,
        stockChange: operation === 'add' ? `+${quantity}` : `-${quantity}`,
       
        updatedAt: new Date().toISOString(),
        updatedBy: (req.user as any)?.email || 'Unknown'
      }
    });

  } catch (error) {
    console.error("Stock update error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update stock"
    });
  }
});

/**
 * GET /products/stock/low - Get products with low stock (Admin only)
 */
router.get("/stock/low", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { threshold = '10', limit = '50' } = req.query;
    
    const thresholdNum = parseInt(threshold as string);
    const limitNum = parseInt(limit as string);

    if (isNaN(thresholdNum) || thresholdNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid threshold parameter",
        errors: ["threshold must be a non-negative number"]
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit parameter", 
        errors: ["limit must be between 1 and 100"]
      });
    }

    const lowStockProducts = await ProductService.getLowStockProducts(thresholdNum);
    const limitedProducts = lowStockProducts.slice(0, limitNum);

    res.status(200).json({
      success: true,
      message: "Low stock products retrieved successfully",
      data: {
        products: limitedProducts.map(product => ({
          id: (product as any)._id.toString(),
          name: product.name,
          stock: product.stock,
          category: product.category,
          price: product.price,
          isActive: product.isActive,
          stockStatus: product.stock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
        })),
        count: limitedProducts.length,
        totalFound: lowStockProducts.length,
        threshold: thresholdNum,
        criticalCount: lowStockProducts.filter(p => p.stock === 0).length,
        lowStockCount: lowStockProducts.filter(p => p.stock > 0 && p.stock <= thresholdNum).length
      }
    });

  } catch (error) {
    console.error("Get low stock products error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve low stock products"
    });
  }
});

/**
 * DELETE /products/:id - Delete product by ID (Admin only)
 */
router.delete("/:id", requireAdmin, validateProductId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists before deletion
    const exists = await ProductService.productExists(id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const deleted = await ProductService.deleteProduct(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete product",
    });
  }
});


export default router;