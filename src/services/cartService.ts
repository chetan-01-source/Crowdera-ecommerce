import Cart from "../models/Cart";
import Product from "../models/Product";
import User from "../models/User";
import { ICart } from "../types/cart";
import { CartResponse, CartItemResponse, AddToCartRequest, UpdateCartItemRequest, CartSummary } from "../types/cart";

export class CartService {
  // Get or create cart for user
  static async getOrCreateCart(userId: string): Promise<ICart> {
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    }
    
    return cart;
  }

  // Get cart with populated product details
  static async  getCartWithDetails(userId: string): Promise<CartResponse | null> {
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.product',
      select: 'name description price stock category brand images isActive'
    });

    if (!cart) {
      return null;
    }

    const cartItems: CartItemResponse[] = cart.items.map((item: any) => {
      const product = item.product;
      return {
        productId: product._id.toString(),
        productName: product.name,
        productDescription: product.description,
        productPrice: product.price,
        productStock: product.stock,
        productCategory: product.category,
        productBrand: product.brand || '',
        productImages: product.images || [],
        quantity: item.quantity,
        priceAtAdd: item.price,
        itemTotal: item.quantity * item.price,
        addedAt: item.addedAt,
        isAvailable: product.isActive && product.stock > 0
      };
    });

    return {
      cartId: cart._id.toString(),
      userId: cart.userId.toString(),
      items: cartItems,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
  }

  // Add item to cart
  static async addToCart(userId: string, addToCartData: AddToCartRequest): Promise<CartResponse> {
    const { productId, quantity } = addToCartData;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    // Check stock availability
    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].addedAt = new Date();
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        addedAt: new Date()
      });
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

    await cart.save();

    // Return updated cart with details
    const updatedCart = await this.getCartWithDetails(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }

    return updatedCart;
  }

  // Update item quantity in cart
  static async updateCartItem(userId: string, productId: string, updateData: UpdateCartItemRequest): Promise<CartResponse> {
    const { quantity } = updateData;

    // Verify product exists if quantity > 0
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        throw new Error('Product not found or inactive');
      }

      // Check stock availability
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
      }
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].addedAt = new Date();
    }

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

    await cart.save();

    // Return updated cart with details
    const updatedCart = await this.getCartWithDetails(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }

    return updatedCart;
  }

  // Remove item from cart
  static async removeFromCart(userId: string, productId: string): Promise<CartResponse> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    // Remove item from cart
    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.quantity * item.price), 0);

    await cart.save();

    // Return updated cart with details
    const updatedCart = await this.getCartWithDetails(userId);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }

    return updatedCart;
  }

  // Clear entire cart
  static async clearCart(userId: string): Promise<{ message: string }> {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;

    await cart.save();

    return { message: 'Cart cleared successfully' };
  }

  // Get cart summary
  static async getCartSummary(userId: string): Promise<CartSummary> {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return {
        totalItems: 0,
        totalAmount: 0,
        itemCount: 0
      };
    }

    return {
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      itemCount: cart.items.length
    };
  }
}