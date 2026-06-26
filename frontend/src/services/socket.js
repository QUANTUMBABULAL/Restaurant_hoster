import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function joinRestaurantRoom(restaurantId) {
  const s = getSocket();
  s.emit('join-restaurant', restaurantId);
}

export function joinOrderRoom(orderId) {
  const s = getSocket();
  s.emit('join-order', orderId);
}

export function leaveOrderRoom(orderId) {
  const s = getSocket();
  s.emit('leave-order', orderId);
}
