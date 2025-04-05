import jwt from 'jsonwebtoken';
import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

// JWT verification middleware
export const verifyToken = (req, res, next) => {
  // console.log('Auth middleware - Headers:', req.headers);
  const authHeader = req.headers.authorization;
  // console.log('Auth middleware - Authorization header:', authHeader);
  
  const token = authHeader?.split(' ')[1];
  // console.log('Auth middleware - Token extracted:', token ? 'Token present' : 'No token');
  
  if (!token) {
    // console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET;
    // console.log('Auth middleware - Using JWT secret:', jwtSecret ? 'Secret present' : 'No secret');
    
    const decoded = jwt.verify(token, jwtSecret);
    // console.log('Auth middleware - Token verified, user:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware - Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};
