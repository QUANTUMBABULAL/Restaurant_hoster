import QRCode from 'qrcode';
import { env } from '../config/env.js';

export async function generateTableQR(restaurantSlug, tableNumber) {
  const url = `${env.clientUrl}/menu?restaurant=${restaurantSlug}&table=${tableNumber}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  return { url, qrDataUrl };
}

export async function generateTableQRBuffer(restaurantSlug, tableNumber) {
  const url = `${env.clientUrl}/menu?restaurant=${restaurantSlug}&table=${tableNumber}`;
  const buffer = await QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    type: 'png',
  });
  return { url, buffer };
}
