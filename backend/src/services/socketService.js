import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-restaurant', (restaurantId) => {
      if (restaurantId) {
        socket.join(`restaurant:${restaurantId}`);
      }
    });

    socket.on('join-order', (orderId) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('leave-order', (orderId) => {
      if (orderId) {
        socket.leave(`order:${orderId}`);
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function emitNewOrder(restaurantId, order) {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit('new-order', order);
  }
}

export function emitOrderUpdate(restaurantId, order) {
  if (io) {
    io.to(`restaurant:${restaurantId}`).emit('order-updated', order);
    io.to(`order:${order._id}`).emit('order-status', {
      orderId: order._id,
      status: order.status,
      order,
    });
  }
}
