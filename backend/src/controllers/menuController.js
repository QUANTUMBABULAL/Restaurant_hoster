import MenuItem from '../models/MenuItem.js';
import Category from '../models/Category.js';

export async function getMenuItems(req, res) {
  const items = await MenuItem.find({ restaurant: req.restaurantId })
    .populate('category', 'name')
    .sort({ createdAt: -1 });
  res.json({ items });
}

export async function createMenuItem(req, res) {
  const { name, description, price, category, isVeg, isAvailable, prepTime, isFeatured } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }

  const cat = await Category.findOne({ _id: category, restaurant: req.restaurantId });
  if (!cat) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  const item = await MenuItem.create({
    restaurant: req.restaurantId,
    name,
    description: description || '',
    price: parseFloat(price),
    category,
    isVeg: isVeg === 'true' || isVeg === true,
    isAvailable: isAvailable !== 'false' && isAvailable !== false,
    prepTime: parseInt(prepTime, 10) || 15,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    image: req.file ? `/uploads/${req.file.filename}` : '',
  });

  await item.populate('category', 'name');
  res.status(201).json({ message: 'Menu item created', item });
}

export async function updateMenuItem(req, res) {
  const item = await MenuItem.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  const { name, description, price, category, isVeg, isAvailable, prepTime, isFeatured } = req.body;

  if (name) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = parseFloat(price);
  if (category) {
    const cat = await Category.findOne({ _id: category, restaurant: req.restaurantId });
    if (!cat) return res.status(400).json({ message: 'Invalid category' });
    item.category = category;
  }
  if (isVeg !== undefined) item.isVeg = isVeg === 'true' || isVeg === true;
  if (isAvailable !== undefined) item.isAvailable = isAvailable !== 'false' && isAvailable !== false;
  if (prepTime !== undefined) item.prepTime = parseInt(prepTime, 10);
  if (isFeatured !== undefined) item.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (req.file) item.image = `/uploads/${req.file.filename}`;

  await item.save();
  await item.populate('category', 'name');
  res.json({ message: 'Menu item updated', item });
}

export async function deleteMenuItem(req, res) {
  const item = await MenuItem.findOneAndDelete({ _id: req.params.id, restaurant: req.restaurantId });
  if (!item) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  res.json({ message: 'Menu item deleted' });
}

export async function getPublicMenu(req, res) {
  const items = await MenuItem.find({
    restaurant: req.restaurant._id,
    isAvailable: true,
  })
    .populate('category', 'name sortOrder')
    .sort({ isFeatured: -1, name: 1 });

  res.json({ items });
}
