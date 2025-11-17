import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { JwtPayload } from "../types/auth";


export class AuthUtils {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
  private static readonly ACCESS_TOKEN_EXPIRES_IN = "3d"; // Short-lived access tokens
  private static readonly REFRESH_TOKEN_EXPIRES_IN = "7d"; // Longer-lived refresh tokens
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate an access token (short-lived)
   */
  static generateAccessToken(payload: Omit<JwtPayload, "tokenType">): string {
    const secret = this.JWT_SECRET as string;
    return (jwt as any).sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tokenType: "access",
      },
      secret,
      {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      }
    );
  }

  /**
   * Generate a refresh token (long-lived)
   */
  static generateRefreshToken(payload: Omit<JwtPayload, "tokenType">): string {
    const secret = this.JWT_SECRET as string;
    return (jwt as any).sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tokenType: "refresh",
        jti: uuidv4(), // Unique identifier for this token
      },
      secret,
      {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: Omit<JwtPayload, "tokenType">) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    return { accessToken, refreshToken };
  }

  /**
   * Generate a JWT token (backward compatibility)
   */
  static generateToken(payload: JwtPayload): string {
    return this.generateAccessToken(payload);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JwtPayload {
    return (jwt as any).verify(token, this.JWT_SECRET) as JwtPayload;
  }

  /**
   * Verify if token is an access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    const payload = this.verifyToken(token);
    if (payload.tokenType && payload.tokenType !== "access") {
      throw new Error("Invalid token type");
    }
    return payload;
  }

  /**
   * Verify if token is a refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    const payload = this.verifyToken(token);
    if (payload.tokenType !== "refresh") {
      throw new Error("Invalid token type");
    }
    return payload;
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return null;
    }
    return authorization.substring(7); // Remove "Bearer " prefix
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: "Password must be at least 6 characters long" };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      };
    }
    return { isValid: true };
  }
}