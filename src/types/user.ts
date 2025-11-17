export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  age?: number;
  address?: string;
  mobileNumber?: string;
  role: UserRole;
   avatar?: string; // Add avatar field
  provider?: string; // Add provider field ('local', 'google', 'github')
  providerId?: string; // Add provider ID field
  refreshTokens?: string[]; // Array of refresh tokens
  createdAt: Date;
  updatedAt: Date;
}