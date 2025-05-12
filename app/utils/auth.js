// utils/auth.js
import jwt from 'jsonwebtoken';

// Function to verify the JWT token
export function verifyToken(token) {
  try {
    // Verify the token using the secret key stored in environment variables
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // If the token is invalid or expired, throw an error
    throw new Error('Invalid or expired token');
  }
}
