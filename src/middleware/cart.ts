import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

// Helper function to check if a string is a valid ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validation for adding item to cart
export const validateAddToCart = (req: Request, res: Response, next: NextFunction) => {
  const { productId, quantity } = req.body;

  const errors: Array<{ field: string; message: string }> = [];

  // Validate productId
  if (!productId) {
    errors.push({ field: 'productId', message: 'Product ID is required' });
  } else if (!isValidObjectId(productId)) {
    errors.push({ field: 'productId', message: 'Product ID must be a valid MongoDB ObjectId' });
  }

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    errors.push({ field: 'quantity', message: 'Quantity must be an integer between 1 and 100' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

// Validation for updating cart item
export const validateUpdateCartItem = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const errors: Array<{ field: string; message: string }> = [];

  // Validate productId from params
  if (!productId || !isValidObjectId(productId)) {
    errors.push({ field: 'productId', message: 'Product ID must be a valid MongoDB ObjectId' });
  }

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (!Number.isInteger(quantity) || quantity < 0 || quantity > 100) {
    errors.push({ field: 'quantity', message: 'Quantity must be an integer between 0 and 100 (0 removes the item)' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

// Validation for product ID parameter
export const validateProductId = (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;

  if (!productId || !isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: [{ field: 'productId', message: 'Product ID must be a valid MongoDB ObjectId' }]
    });
  }

  next();
};

// Validation for cart query parameters (optional)
export const validateCartQuery = (req: Request, res: Response, next: NextFunction) => {
  const { include } = req.query;

  const errors: Array<{ field: string; message: string }> = [];

  // Validate include parameter if provided
  if (include && !['details', 'summary'].includes(include as string)) {
    errors.push({ field: 'include', message: 'Include parameter must be either "details" or "summary"' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};