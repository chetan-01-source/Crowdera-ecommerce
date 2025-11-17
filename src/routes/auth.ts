import { Router, Request, Response } from "express";
import { UserService } from "../services/userService";
import { authenticate } from "../middleware/auth";
import { 
  validateUserRegistration, 
  validateUserLogin,  
} from "../middleware/user";
import limiter from '../middleware/rateLimiter'
const router = Router();

/**
 * POST /auth/register - Register a new user
 */
router.post("/register", limiter.limiter, validateUserRegistration, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, age, address, mobileNumber } = req.body;

    const result = await UserService.register(email, password, name, role, age, address, mobileNumber);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    });
  }
});

/**
 * POST /auth/login - Login user
 */
router.post("/login", limiter.loginLimiter, validateUserLogin, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await UserService.login(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
});

/**
 * POST /auth/refresh - Refresh access token
 */
router.post("/refresh", limiter.limiter, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokens = await UserService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: tokens,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : "Invalid refresh token",
    });
  }
});

/**
 * POST /auth/logout - Logout user (remove refresh token)
 */
router.post("/logout", limiter.limiter, async (req: Request, res: Response) => {
  try {
    const { refreshToken, userId } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    if (userId) {
      await UserService.removeRefreshToken(userId, refreshToken);
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Logout failed",
    });
  }
});


/**
 * GET /auth/profile - Get user profile (protected route)
 */
router.get("/profile", limiter.limiter, authenticate, async (req: Request, res: Response) => {
  try {
  const user = req.user;
  if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      age: user.age,
      address: user.address,
      mobileNumber: user.mobileNumber,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve profile",
    });
  }
});

export default router;