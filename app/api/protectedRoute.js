// pages/api/protectedRoute.js
import { verifyToken } from '../../utils/auth'; // Import the verifyToken function

export default async function handler(req, res) {
  // Ensure that the method is GET (you can change this depending on your use case)
  if (req.method === 'GET') {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Format: 'Bearer token'

    // If no token is provided, respond with 401 Unauthorized
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Verify the token
      const decoded = verifyToken(token);
      
      // If token is valid, you can access the user info in `decoded`
      return res.status(200).json({ message: 'This is a protected route', user: decoded });
    } catch (error) {
      // If the token is invalid or expired, respond with 401 Unauthorized
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } else {
    // If the method is not GET, respond with 405 Method Not Allowed
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
