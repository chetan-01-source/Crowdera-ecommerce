import { Document, Types } from "mongoose";

// Cart Item Interface
export interface ICartItem {
  product: Types.ObjectId | string; // Reference to Product
  quantity: number;
  price: number; // Store price at time of adding to cart
  addedAt: Date;
}

// Cart Document Interface
export interface ICart extends Document {
  _id: any;
  userId: Types.ObjectId | string; // Reference to User
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Response Interfaces
export interface CartItemResponse {
  productId: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
  productCategory: string;
  productBrand?: string;
  productImages: string[];
  quantity: number;
  priceAtAdd: number;
  itemTotal: number;
  addedAt: Date;
  isAvailable: boolean;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Operation Interfaces
export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number;
  itemCount: number;
}

export default ICart;