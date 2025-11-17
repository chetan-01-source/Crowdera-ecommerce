import mongoose, { Document, Schema, Model } from "mongoose";
import { UserRole } from "../types/user";

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  age?: number;
  address?: string;
  mobileNumber?: string;
  avatar?: string; // Add avatar field
  provider?: string; // Add provider field ('local', 'google', 'github')
  providerId?: string; // Add provider ID field
  refreshTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for static methods

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email: string) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
     // Add OAuth fields
  avatar: {
    type: String,
    trim: true,
  },
  
  provider: {
    type: String,
    default: 'local',
    enum: ['local', 'google', 'github'],
  },
  
  providerId: {
    type: String,
    sparse: true, // Allows multiple null values
  },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    age: {
      type: Number,
      min: [13, "Age must be at least 13"],
      max: [120, "Age cannot exceed 120"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    mobileNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (mobile: string) {
          if (!mobile) return true; // Optional field
          const mobileRegex = /^[+]?[1-9][\d\-\s\(\)]{7,15}$/;
          return mobileRegex.test(mobile);
        },
        message: "Invalid mobile number format",
      },
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Role must be either 'user' or 'admin'",
      },
      default: UserRole.USER,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disable __v field
  }
);

// Index for performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ mobileNumber: 1 });
UserSchema.index({ name: 1 });



// Pre-save middleware (if needed for additional validation)
UserSchema.pre("save", function (next) {

  next();
});

// Create and export the User model
export const User = mongoose.model<IUser>("User", UserSchema);

export default User;