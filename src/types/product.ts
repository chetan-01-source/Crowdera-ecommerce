import { Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;       // e.g. "electronics", "clothing", "books"
  brand?: string;
  images: string[];       // Array of image URLs
  tags?: string[];        // Search tags for better discoverability
  isActive: boolean;      // Show/hide product from catalog
  createdAt: Date;
  updatedAt: Date;
}

// Product categories enum for consistency
export enum ProductCategory {
  ELECTRONICS = "electronics",
  CLOTHING = "clothing",
  BOOKS = "books",
  HOME_GARDEN = "home-garden",
  SPORTS_OUTDOORS = "sports-outdoors",
  HEALTH_BEAUTY = "health-beauty",
  TOYS_GAMES = "toys-games",
  AUTOMOTIVE = "automotive",
  FOOD_BEVERAGES = "food-beverages",
  OTHER = "other"
}

// Interface for product creation/update requests
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory | string;
  brand?: string;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory | string;
  brand?: string;
  images?: string[];
  tags?: string[];
  isActive?: boolean;
}

// Product search/filter interface
export interface ProductSearchQuery {
  name?: string;
  category?: ProductCategory | string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Product response interface (for API responses)
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  images: string[];
  tags?: string[];
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}


export default IProduct;