import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import { generateTableQR, generateTableQRBuffer } from '../services/qrService.js';

export async function getTables(req, res) {
  const tables = await Table.find({ restaurant: req.restaurantId }).sort({ tableNumber: 1 });
  res.json({ tables });
}

export async function createTable(req, res) {
  const { name, tableNumber } = req.body;

  if (!name || tableNumber === undefined) {
    return res.status(400).json({ message: 'Name and table number are required' });
  }

  const table = await Table.create({
    restaurant: req.restaurantId,
    name,
    tableNumber: parseInt(tableNumber, 10),
  });

  res.status(201).json({ message: 'Table created', table });
}

export async function updateTable(req, res) {
  const table = await Table.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!table) {
    return res.status(404).json({ message: 'Table not found' });
  }

  const { name, tableNumber, isActive } = req.body;
  if (name) table.name = name;
  if (tableNumber !== undefined) table.tableNumber = parseInt(tableNumber, 10);
  if (isActive !== undefined) table.isActive = isActive;

  await table.save();
  res.json({ message: 'Table updated', table });
}

export async function deleteTable(req, res) {
  const table = await Table.findOneAndDelete({ _id: req.params.id, restaurant: req.restaurantId });
  if (!table) {
    return res.status(404).json({ message: 'Table not found' });
  }
  res.json({ message: 'Table deleted' });
}

export async function getTableQR(req, res) {
  const table = await Table.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!table) {
    return res.status(404).json({ message: 'Table not found' });
  }

  const restaurant = await Restaurant.findById(req.restaurantId);
  const { url, qrDataUrl } = await generateTableQR(restaurant.slug, table.tableNumber);

  res.json({
    table,
    qrUrl: url,
    qrDataUrl,
  });
}

export async function downloadTableQR(req, res) {
  const table = await Table.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!table) {
    return res.status(404).json({ message: 'Table not found' });
  }

  const restaurant = await Restaurant.findById(req.restaurantId);
  const { url, buffer } = await generateTableQRBuffer(restaurant.slug, table.tableNumber);

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Disposition', `attachment; filename="table-${table.tableNumber}-qr.png"`);
  res.send(buffer);
}

export async function validateTable(req, res) {
  const { slug, tableNumber } = req.params;
  const restaurant = await Restaurant.findOne({ slug, isActive: true });
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  const table = await Table.findOne({
    restaurant: restaurant._id,
    tableNumber: parseInt(tableNumber, 10),
    isActive: true,
  });

  if (!table) {
    return res.status(404).json({ message: 'Table not found' });
  }

  res.json({ restaurant, table });
}
