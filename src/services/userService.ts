import {  RegisterRequest, AuthResponse } from "../types/auth";
import { UserRole } from "../types/user";
import { AuthUtils } from "../utils/auth";
import User, { IUser } from "../models/User";
import { Types } from "mongoose";

/**
 * MongoDB-based user service
 */
class UserServiceClass {
  constructor() {
    // Create a default admin user for testing
    this.createDefaultAdmin();
  }

  /**
   * Create default admin user
   */
  private async createDefaultAdmin(): Promise<void> {
    try {
      const adminExists = await User.findOne({ email: "admin@crowdera.com" });
      if (!adminExists) {
        const hashedPassword = await AuthUtils.hashPassword("Admin@123");
        const admin = new User({
          name: "Admin",
          age: 30,
          address: "Admin Address",
          mobileNumber: "1234567890",
          email: "admin@crowdera.com",
          password: hashedPassword,
          role: UserRole.ADMIN,
        });
        await admin.save();
        console.log("🟢 Default admin user created: admin@crowdera.com / Admin@123");
      }
    } catch (error) {
      console.error("🔴 Error creating default admin:", error);
    }
  }

  /**
   * Register a new user
   */
  async register(
    email: string, 
    password: string, 
    name: string,
    role?: UserRole,
    age?: number,
    address?: string,
    mobileNumber?: string
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error("User already exists with this email");
      }

      // Hash password
      const hashedPassword = await AuthUtils.hashPassword(password);

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        age,
        address: address?.trim(),
        mobileNumber: mobileNumber?.trim(),
        role: role || UserRole.USER,
        refreshTokens: [], // Initialize empty refresh tokens array
      });

      const savedUser = await user.save();

      // Generate token pair
      const { accessToken, refreshToken } = AuthUtils.generateTokenPair({
        userId: (savedUser._id as Types.ObjectId).toString(),
        email: savedUser.email,
        role: savedUser.role,
      });

      // Save refresh token to user
      await this.addRefreshToken((savedUser._id as Types.ObjectId).toString(), refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          id: (savedUser._id as Types.ObjectId).toString(),
          email: savedUser.email,
          name: savedUser.name,
          age: savedUser.age,
          address: savedUser.address,
          mobileNumber: savedUser.mobileNumber,
          role: savedUser.role,
          createdAt: savedUser.createdAt,
          updatedAt: savedUser.updatedAt,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate token pair
      const { accessToken, refreshToken } = AuthUtils.generateTokenPair({
        userId: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      });

      // Save refresh token to user
      await this.addRefreshToken((user._id as Types.ObjectId).toString(), refreshToken);

      return {
        accessToken,
        refreshToken,
        user: {
          id: (user._id as Types.ObjectId).toString(),
          email: user.email,
          name: user.name,
          age: user.age,
          address: user.address,
          mobileNumber: user.mobileNumber,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      return await User.findById(id);
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  /**
   * Find user by email
   */
 

  /**
   * Get all users with pagination
   */
  async getAllUsersWithPagination(
    query: any = {}, 
    limit: number = 30, 
    sortOrder: 1 | -1 = -1
  ): Promise<any[]> {
    try {
      return await User.find(query, "-password -refreshTokens")
        .sort({ _id: sortOrder })
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Error getting users with pagination:", error);
      throw new Error("Failed to retrieve users");
    }
  }

  

  /**
   * Delete user by ID
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
      const result = await User.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }


 

  /**
   * Add refresh token to user
   */
  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

     
      if (!user.refreshTokens) {
        user.refreshTokens = [];
      }
      if (user.refreshTokens.length >= 5) {
        // Remove oldest token
        user.refreshTokens.shift();
      }
      user.refreshTokens.push(refreshToken);
      await user.save();
    } catch (error) {
      console.error("Error adding refresh token:", error);
      throw new Error("Failed to add refresh token");
    }
  }

  /**
   * Remove refresh token from user
   */
  async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(
        userId,
        { $pull: { refreshTokens: refreshToken } },{
          runValidators: true
        }
      );
    } catch (error) {
      console.error("Error removing refresh token:", error);
    }
  }

  /**
   * Find user by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    try {
      return await User.findOne({ refreshTokens: refreshToken });
    } catch (error) {
      console.error("Error finding user by refresh token:", error);
      return null;
    }
  }

  /**
   * Remove all refresh tokens for user (logout from all devices)
   */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(
        userId,
        { $set: { refreshTokens: [] } }
      );
    } catch (error) {
      console.error("Error removing all refresh tokens:", error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);
      if (!decoded) {
        throw new Error("Invalid refresh token");
      }

      // Find user by refresh token
      const user = await this.findByRefreshToken(refreshToken);
      if (!user) {
        throw new Error("Invalid refresh token");
      }

      // Remove old refresh token
      await this.removeRefreshToken((user._id as Types.ObjectId).toString(), refreshToken);

      // Generate new token pair
      const newTokens = AuthUtils.generateTokenPair({
        userId: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      });

      // Save new refresh token
      await this.addRefreshToken((user._id as Types.ObjectId).toString(), newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw new Error("Failed to refresh token");
    }
  }
}

// Export singleton instance
export const UserService = new UserServiceClass();
