import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dineflow',
  jwtSecret: process.env.JWT_SECRET || 'dineflow-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
