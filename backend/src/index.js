import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './services/socketService.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DineFlow API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  server.listen(env.port, () => {
    console.log(`DineFlow API running on http://localhost:${env.port}`);
  });
}

start();
