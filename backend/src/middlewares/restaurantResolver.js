import Restaurant from '../models/Restaurant.js';

export async function resolveRestaurant(req, res, next) {
  const slug = req.params.slug || req.query.restaurant;
  if (!slug) {
    return res.status(400).json({ message: 'Restaurant slug is required' });
  }

  const restaurant = await Restaurant.findOne({ slug, isActive: true });
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }

  req.restaurant = restaurant;
  next();
}
