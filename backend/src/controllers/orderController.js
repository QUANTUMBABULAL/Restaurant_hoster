import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import { generateOrderNumber } from '../utils/helpers.js';
import { emitNewOrder, emitOrderUpdate } from '../services/socketService.js';

const VALID_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled'];

export async function getOrders(req, res) {
  const { status } = req.query;
  const filter = { restaurant: req.restaurantId };
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate('table', 'name tableNumber');

  res.json({ orders });
}

export async function getOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, restaurant: req.restaurantId })
    .populate('table', 'name tableNumber');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.json({ order });
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const order = await Order.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  await order.save();
  await order.populate('table', 'name tableNumber');

  emitOrderUpdate(req.restaurantId, order);

  res.json({ message: 'Order status updated', order });
}

export async function placeOrder(req, res) {
  const { restaurantSlug, tableNumber, items, customerNote } = req.body;

  if (!restaurantSlug || !tableNumber || !items?.length) {
    return res.status(400).json({ message: 'Restaurant, table, and items are required' });
  }

  const restaurant = await Restaurant.findOne({ slug: restaurantSlug, isActive: true });
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

  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of items) {
    const menuItem = await MenuItem.findOne({
      _id: cartItem.menuItemId,
      restaurant: restaurant._id,
      isAvailable: true,
    });

    if (!menuItem) {
      return res.status(400).json({ message: `Item not available: ${cartItem.menuItemId}` });
    }

    const qty = parseInt(cartItem.quantity, 10) || 1;
    orderItems.push({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: qty,
      isVeg: menuItem.isVeg,
      image: menuItem.image,
    });
    subtotal += menuItem.price * qty;
  }

  const order = await Order.create({
    restaurant: restaurant._id,
    table: table._id,
    tableNumber: table.tableNumber,
    tableName: table.name,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    subtotal,
    total: subtotal,
    customerNote: customerNote || '',
    status: 'pending',
  });

  await order.populate('table', 'name tableNumber');
  emitNewOrder(restaurant._id.toString(), order);

  res.status(201).json({ message: 'Order placed successfully', order });
}

export async function getPublicOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json({ order });
}

export async function getAnalytics(req, res) {
  const restaurantId = req.restaurantId;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await Order.find({
    restaurant: restaurantId,
    createdAt: { $gte: thirtyDaysAgo },
    status: { $ne: 'cancelled' },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;

  const statusBreakdown = VALID_STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  const dailyRevenue = {};
  orders.forEach((order) => {
    const day = order.createdAt.toISOString().split('T')[0];
    dailyRevenue[day] = (dailyRevenue[day] || 0) + order.total;
  });

  const topItems = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!topItems[item.name]) {
        topItems[item.name] = { name: item.name, quantity: 0, revenue: 0 };
      }
      topItems[item.name].quantity += item.quantity;
      topItems[item.name].revenue += item.price * item.quantity;
    });
  });

  const sortedTopItems = Object.values(topItems)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  res.json({
    analytics: {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue: Math.round(avgOrderValue),
      statusBreakdown,
      dailyRevenue,
      topItems: sortedTopItems,
    },
  });
}
