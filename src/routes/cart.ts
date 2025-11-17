import express from 'express';
import { CartService } from '../services/cartService';
import { authenticate } from '../middleware/auth';
import { validateAddToCart, validateUpdateCartItem, validateProductId, validateCartQuery } from '../middleware/cart';

const router = express.Router();

// Get user's cart with full product details
router.get('/', authenticate, validateCartQuery, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
        error: 'INVALID_TOKEN'
      });
    }

    const { include } = req.query;

    if (include === 'summary') {
      // Return cart summary only
      const summary = await CartService.getCartSummary(userId);
      return res.json({
        success: true,
        message: 'Cart summary retrieved successfully',
        data: summary
      });
    }

    // Get full cart details
    const cart = await CartService.getCartWithDetails(userId);
    
    if (!cart) {
      return res.json({
        success: true,
        message: 'Cart is empty',
        data: {
          cartId: null,
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

  

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add item to cart
router.post('/add', authenticate, validateAddToCart, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
        error: 'INVALID_TOKEN'
      });
    }

    const { productId, quantity } = req.body;

    const cart = await CartService.addToCart(userId, { productId, quantity });

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes('not found') || message.includes('inactive')) {
        return res.status(404).json({
          success: false,
          message,
          error: 'PRODUCT_NOT_FOUND'
        });
      }
      
      if (message.includes('stock')) {
        return res.status(400).json({
          success: false,
          message,
          error: 'INSUFFICIENT_STOCK'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update cart item quantity
router.patch('/items/:productId', authenticate, validateUpdateCartItem, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
        error: 'INVALID_TOKEN'
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateCartItem(userId, productId, { quantity });

    res.json({
      success: true,
      message: quantity > 0 ? 'Cart item updated successfully' : 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message,
          error: message.includes('Cart') ? 'CART_NOT_FOUND' : 'ITEM_NOT_FOUND'
        });
      }
      
      if (message.includes('stock')) {
        return res.status(400).json({
          success: false,
          message,
          error: 'INSUFFICIENT_STOCK'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove item from cart
router.delete('/items/:productId', authenticate, validateProductId, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
        error: 'INVALID_TOKEN'
      });
    }

    const { productId } = req.params;

    const cart = await CartService.removeFromCart(userId, productId);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: 'CART_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear entire cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in token',
        error: 'INVALID_TOKEN'
      });
    }

    const result = await CartService.clearCart(userId);

    res.json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        error: 'CART_NOT_FOUND'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;