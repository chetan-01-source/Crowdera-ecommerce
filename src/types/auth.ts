import { User, UserRole } from "./user";

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  role?: UserRole;
}

export interface AuthResponse {
  user: Omit<User, "password" | "refreshTokens">;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
export enum AuthErrorCode {
  NO_TOKEN = "NO_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType?: "access" | "refresh";
}

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}

export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};