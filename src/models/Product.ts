import mongoose, { Schema, Model } from "mongoose";
import { IProduct, ProductCategory } from "../types/product";

// Product Schema
const ProductSchema: Schema<IProduct> = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [2, "Product name must be at least 2 characters long"],
    maxlength: [200, "Product name cannot exceed 200 characters"],
    index: true // For better search performance
  },
  
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
    minlength: [10, "Description must be at least 10 characters long"],
    maxlength: [2000, "Description cannot exceed 2000 characters"]
  },
  
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
    validate: {
      validator: function(value: number) {
        return value >= 0 && value <= 999999.99;
      },
      message: "Price must be between 0 and 999999.99"
    },
    index: true // For price-based queries
  },
  
  stock: {
    type: Number,
    required: [true, "Stock quantity is required"],
    min: [0, "Stock cannot be negative"],
    default: 0,
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 0;
      },
      message: "Stock must be a non-negative integer"
    },
    index: true // For inventory queries
  },
  
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: {
      values: Object.values(ProductCategory),
      message: "Invalid product category"
    },
    lowercase: true,
    trim: true,
    index: true // For category-based filtering
  },
  
  brand: {
    type: String,
    trim: true,
    maxlength: [100, "Brand name cannot exceed 100 characters"],
    index: true // For brand-based filtering
  },
  
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images: string[]) {
        return images.length <= 10; // Max 10 images per product
      },
      message: "Cannot have more than 10 images per product"
    }
  },
  
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 20; // Max 20 tags per product
      },
      message: "Cannot have more than 20 tags per product"
    },
    index: true // For tag-based search
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true // For filtering active/inactive products
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// // Compound indexes for better query performance
// ProductSchema.index({ category: 1, price: 1 }); // Category + price filtering
// ProductSchema.index({ category: 1, isActive: 1 }); // Active products by category
ProductSchema.index({ name: "text", description: "text", tags: "text" }); // Text search
// ProductSchema.index({ createdAt: -1 }); // Sort by newest first
// ProductSchema.index({ price: 1, stock: 1 }); // Price and availability queries


// Pre-save middleware
ProductSchema.pre('save', function(next) {
  // Ensure category is lowercase
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  // Ensure price has max 2 decimal places
  if (this.price) {
    this.price = Math.round(this.price * 100) / 100;
  }
  
  next();
});



// Create and export the model
const Product: Model<IProduct> = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;