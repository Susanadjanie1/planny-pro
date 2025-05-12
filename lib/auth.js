import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No token provided');
      return null;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded; // e.g., { email, role, userId }
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}
