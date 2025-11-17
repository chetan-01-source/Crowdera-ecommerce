import mongoose, { Schema, model } from "mongoose";
import { ICart, ICartItem } from "../types/cart";

// Extend the model interface to include static methods
interface CartModel extends mongoose.Model<ICart, {}> {}

// Cart Item Schema
const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Cart Schema
const CartSchema = new Schema<ICart>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One cart per user
    index: true
  },
  items: [CartItemSchema],
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});



// Pre-save middleware to calculate totals
CartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  }
  next();
});
// Indexes for better performance
CartSchema.index({ userId: 1 });
CartSchema.index({ 'items.product': 1 });
CartSchema.index({ createdAt: -1 });

const Cart = model<ICart, CartModel>('Cart', CartSchema);

export default Cart;