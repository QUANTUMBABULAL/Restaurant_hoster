import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';
import Table from '../models/Table.js';

export async function getDashboardStats(req, res) {
  const restaurantId = req.restaurantId;

  const [totalOrders, pendingOrders, menuItems, categories, tables] = await Promise.all([
    Order.countDocuments({ restaurant: restaurantId }),
    Order.countDocuments({ restaurant: restaurantId, status: 'pending' }),
    MenuItem.countDocuments({ restaurant: restaurantId }),
    Category.countDocuments({ restaurant: restaurantId }),
    Table.countDocuments({ restaurant: restaurantId }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.find({
    restaurant: restaurantId,
    createdAt: { $gte: today },
  });

  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = await Order.find({ restaurant: restaurantId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('table', 'name tableNumber');

  res.json({
    stats: {
      totalOrders,
      pendingOrders,
      menuItems,
      categories,
      tables,
      todayOrders: todayOrders.length,
      todayRevenue,
    },
    recentOrders,
  });
}

export async function updateRestaurant(req, res) {
  const { name, description, address, phone, currency } = req.body;
  const restaurant = await Restaurant.findById(req.restaurantId);

  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  if (name) restaurant.name = name;
  if (description !== undefined) restaurant.description = description;
  if (address !== undefined) restaurant.address = address;
  if (phone !== undefined) restaurant.phone = phone;
  if (currency) restaurant.currency = currency;

  if (req.file) {
    restaurant.logo = `/uploads/${req.file.filename}`;
  }

  await restaurant.save();

  res.json({ message: 'Restaurant updated', restaurant });
}

export async function getRestaurantBySlug(req, res) {
  const restaurant = await Restaurant.findOne({ slug: req.params.slug, isActive: true });
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  res.json({ restaurant });
}
