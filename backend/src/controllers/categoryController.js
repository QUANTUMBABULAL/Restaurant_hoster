import Category from '../models/Category.js';

export async function getCategories(req, res) {
  const categories = await Category.find({ restaurant: req.restaurantId }).sort({ sortOrder: 1, name: 1 });
  res.json({ categories });
}

export async function createCategory(req, res) {
  const { name, sortOrder } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const category = await Category.create({
    restaurant: req.restaurantId,
    name,
    sortOrder: sortOrder || 0,
  });

  res.status(201).json({ message: 'Category created', category });
}

export async function updateCategory(req, res) {
  const category = await Category.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const { name, sortOrder, isActive } = req.body;
  if (name) category.name = name;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  res.json({ message: 'Category updated', category });
}

export async function deleteCategory(req, res) {
  const category = await Category.findOneAndDelete({ _id: req.params.id, restaurant: req.restaurantId });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json({ message: 'Category deleted' });
}

export async function getPublicCategories(req, res) {
  const categories = await Category.find({
    restaurant: req.restaurant._id,
    isActive: true,
  }).sort({ sortOrder: 1, name: 1 });
  res.json({ categories });
}
