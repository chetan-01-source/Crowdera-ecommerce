import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 25, // max 25 requests per minute
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    error: "RATE_LIMIT_EXCEEDED"
  }
});

const limiter = apiLimiter; // Direct assignment, not a function wrapper

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 5 login attempts per minute
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
    error: "LOGIN_RATE_LIMIT_EXCEEDED"
  },
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

export default { limiter, loginLimiter };