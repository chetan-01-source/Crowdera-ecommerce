import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "../utils/auth";
import {  ApiResponse } from "../types/auth";
import { UserRole } from "../types/user";
import { UserService } from "../services/userService";
import { AuthErrorCode } from "../types/auth";
/**
 * Enhanced error codes for different auth scenarios
 */

/**
 * Middleware to verify JWT token and add user to request
 */
export const authenticate = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        error: AuthErrorCode.NO_TOKEN,
      });
      return;
    }

    try {
      const decoded = AuthUtils.verifyAccessToken(token);
      
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: "Invalid access token.",
          error: AuthErrorCode.TOKEN_INVALID,
        });
        return;
      }

      const user = await UserService.findById(decoded.userId);
     
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid token. User not found.",
          error: AuthErrorCode.USER_NOT_FOUND,
        });
        return;
      }

      // Add user to request object (excluding password)
      req.user = {
        id: (user._id as any).toString(),
        email: user.email,
        name: user.name,
        age: user.age,
        address: user.address,
        mobileNumber: user.mobileNumber,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      next();

    } catch (jwtError: any) {
      // Check if it's a JWT expiration error
      if (jwtError.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          message: "Access token has expired.",
          error: AuthErrorCode.TOKEN_EXPIRED,
        });
        return;
      }

      // Other JWT errors (malformed, invalid signature, etc.)
      res.status(401).json({
        success: false,
        message: "Invalid access token.",
        error: AuthErrorCode.TOKEN_INVALID,
      });
      return;
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
      error: "INTERNAL_ERROR",
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
      error: AuthErrorCode.NO_TOKEN,
    });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
      error: AuthErrorCode.INSUFFICIENT_PERMISSIONS,
    });
    return;
  }

  next();
};

