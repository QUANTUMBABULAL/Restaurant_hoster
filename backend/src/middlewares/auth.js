import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.userId).populate('restaurant');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.restaurantId = user.restaurant._id.toString();
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRestaurant(req, res, next) {
  if (!req.restaurantId) {
    return res.status(403).json({ message: 'Restaurant access required' });
  }
  next();
}
