import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user";

// Regular expression patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
const MOBILE_REGEX = /^[+]?[1-9][\d\-\s\(\)]{7,15}$/;
const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;

// Validation error response interface
interface ValidationError {
  field: string;
  message: string;
}

// Validation response helper
const sendValidationError = (res: Response, errors: ValidationError[]) => {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors,
    error: "VALIDATION_ERROR",
  });
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'Email is required' };
  }
  
  if (email.length > 255) {
    return { field: 'email', message: 'Email cannot exceed 255 characters' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Invalid email format' };
  }
  
  return null;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string, isUpdate: boolean = false): ValidationError | null => {
  if (!password || typeof password !== 'string') {
    if (isUpdate) {
      return null; // Password is optional on update
    }
    return { field: 'password', message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { field: 'password', message: 'Password cannot exceed 128 characters' };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      field: 'password', 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return null;
};

/**
 * Validate user name
 */
export const validateName = (name: string, isUpdate: boolean = false): ValidationError | null => {
  if (!name || typeof name !== 'string') {
    if (isUpdate) {
      return null; // Name is optional on update
    }
    return { field: 'name', message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 50) {
    return { field: 'name', message: 'Name cannot exceed 50 characters' };
  }
  
  if (!NAME_REGEX.test(trimmedName)) {
    return { field: 'name', message: 'Name can only contain letters and spaces' };
  }
  
  return null;
};

/**
 * Validate age
 */
export const validateAge = (age: any): ValidationError | null => {
  if (age === undefined || age === null || age === '') {
    return null; // Age is optional
  }
  
  const numAge = Number(age);
  
  if (!Number.isInteger(numAge) || isNaN(numAge)) {
    return { field: 'age', message: 'Age must be a valid integer' };
  }
  
  if (numAge < 13) {
    return { field: 'age', message: 'Age must be at least 13' };
  }
  
  if (numAge > 120) {
    return { field: 'age', message: 'Age cannot exceed 120' };
  }
  
  return null;
};

/**
 * Validate mobile number
 */
export const validateMobileNumber = (mobileNumber: any): ValidationError | null => {

    console.log("Validating mobile number:", mobileNumber);
  if (!mobileNumber || typeof mobileNumber !== 'string') {
    return null; // Mobile number is optional
  }
  
  const trimmedMobile = mobileNumber.trim();
  
  if (trimmedMobile.length < 8) {
    return { field: 'mobileNumber', message: 'Mobile number must be at least 8 characters long' };
  }
  
  if (trimmedMobile.length > 20) {
    return { field: 'mobileNumber', message: 'Mobile number cannot exceed 20 characters' };
  }
  
  if (!MOBILE_REGEX.test(trimmedMobile)) {
    return { field: 'mobileNumber', message: 'Invalid mobile number format' };
  }
  
  return null;
};

/**
 * Validate address
 */
export const validateAddress = (address: any): ValidationError | null => {
  if (!address || typeof address !== 'string') {
    return null; // Address is optional
  }
  
  const trimmedAddress = address.trim();
  
  if (trimmedAddress.length < 5) {
    return { field: 'address', message: 'Address must be at least 5 characters long' };
  }
  
  if (trimmedAddress.length > 200) {
    return { field: 'address', message: 'Address cannot exceed 200 characters' };
  }
  
  return null;
};

/**
 * Validate user role
 */
export const validateRole = (role: any): ValidationError | null => {
  if (!role) {
    return null; // Role is optional, defaults to USER
  }
  
  if (typeof role !== 'string') {
    return { field: 'role', message: 'Role must be a string' };
  }
  
  if (!Object.values(UserRole).includes(role as UserRole)) {
    return { field: 'role', message: `Role must be one of: ${Object.values(UserRole).join(', ')}` };
  }
  
  return null;
};

/**
 * Middleware for validating user registration data
 */
export const validateUserRegistration = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password, name, age, address, mobileNumber, role } = req.body;
  
  const errors: ValidationError[] = [];
  
  // Validate required fields
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const nameError = validateName(name);
  
  if (emailError) errors.push(emailError);
  if (passwordError) errors.push(passwordError);
  if (nameError) errors.push(nameError);
  
  // Validate optional fields
  const ageError = validateAge(age);
  console.log("Validating mobile number:", mobileNumber);
  const mobileError = validateMobileNumber(mobileNumber);
  const addressError = validateAddress(address);
  const roleError = validateRole(role);
  
  if (ageError) errors.push(ageError);
  if (mobileError) errors.push(mobileError);
  if (addressError) errors.push(addressError);
  if (roleError) errors.push(roleError);
  
  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  
  // Sanitize and normalize data
  req.body.email = email.toLowerCase().trim();
  req.body.name = name.trim();
  if (address) req.body.address = address.trim();
  if (mobileNumber) req.body.mobileNumber = mobileNumber.trim();
  if (role) req.body.role = role.toLowerCase();
  
  next();
};

/**
 * Middleware for validating user login data
 */
export const validateUserLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  
  const errors: ValidationError[] = [];
  
  // Basic validation for login (less strict than registration)
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }
  
  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  
  // Normalize email
  req.body.email = email.toLowerCase().trim();
  
  next();
};

/**
 * Middleware for validating user profile update data
 */
export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { email, name, age, address, mobileNumber, role } = req.body;
  
  const errors: ValidationError[] = [];
  
  // Validate provided fields (all optional for updates)
  if (email !== undefined) {
    const emailError = validateEmail(email);
    if (emailError) errors.push(emailError);
  }
  
  if (name !== undefined) {
    const nameError = validateName(name, true);
    if (nameError) errors.push(nameError);
  }
  
  const ageError = validateAge(age);
  const mobileError = validateMobileNumber(mobileNumber);
  const addressError = validateAddress(address);
  const roleError = validateRole(role);
  
  if (ageError) errors.push(ageError);
  if (mobileError) errors.push(mobileError);
  if (addressError) errors.push(addressError);
  if (roleError) errors.push(roleError);
  
  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }
  
  // Sanitize provided data
  if (email) req.body.email = email.toLowerCase().trim();
  if (name) req.body.name = name.trim();
  if (address) req.body.address = address.trim();
  if (mobileNumber) req.body.mobileNumber = mobileNumber.trim();
  if (role) req.body.role = role.toLowerCase();
  
  next();
};

/**
 * Middleware for validating password change data
 */

/**
 * General user data sanitizer
 */
export const sanitizeUserData = (data: any): any => {
  const sanitized: any = {};
  
  if (data.email) sanitized.email = data.email.toLowerCase().trim();
  if (data.name) sanitized.name = data.name.trim();
  if (data.address) sanitized.address = data.address.trim();
  if (data.mobileNumber) sanitized.mobileNumber = data.mobileNumber.trim();
  if (data.role) sanitized.role = data.role.toLowerCase();
  if (data.age !== undefined) sanitized.age = Number(data.age);
  
  return sanitized;
};

export default {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEmail,
  validatePassword,
  validateName,
  validateAge,
  validateMobileNumber,
  validateAddress,
  validateRole,
  sanitizeUserData,
};