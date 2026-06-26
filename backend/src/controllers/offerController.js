import Offer from '../models/Offer.js';

export async function getOffers(req, res) {
  const offers = await Offer.find({ restaurant: req.restaurantId }).sort({ createdAt: -1 });
  res.json({ offers });
}

export async function createOffer(req, res) {
  const { title, description, discountType, discountValue, minOrderAmount, validUntil } = req.body;

  if (!title || discountValue === undefined) {
    return res.status(400).json({ message: 'Title and discount value are required' });
  }

  const offer = await Offer.create({
    restaurant: req.restaurantId,
    title,
    description: description || '',
    discountType: discountType || 'percentage',
    discountValue: parseFloat(discountValue),
    minOrderAmount: parseFloat(minOrderAmount) || 0,
    validUntil: validUntil ? new Date(validUntil) : null,
  });

  res.status(201).json({ message: 'Offer created', offer });
}

export async function updateOffer(req, res) {
  const offer = await Offer.findOne({ _id: req.params.id, restaurant: req.restaurantId });
  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }

  const { title, description, discountType, discountValue, minOrderAmount, isActive, validUntil } = req.body;

  if (title) offer.title = title;
  if (description !== undefined) offer.description = description;
  if (discountType) offer.discountType = discountType;
  if (discountValue !== undefined) offer.discountValue = parseFloat(discountValue);
  if (minOrderAmount !== undefined) offer.minOrderAmount = parseFloat(minOrderAmount);
  if (isActive !== undefined) offer.isActive = isActive;
  if (validUntil !== undefined) offer.validUntil = validUntil ? new Date(validUntil) : null;

  await offer.save();
  res.json({ message: 'Offer updated', offer });
}

export async function deleteOffer(req, res) {
  const offer = await Offer.findOneAndDelete({ _id: req.params.id, restaurant: req.restaurantId });
  if (!offer) {
    return res.status(404).json({ message: 'Offer not found' });
  }
  res.json({ message: 'Offer deleted' });
}

export async function getPublicOffers(req, res) {
  const now = new Date();
  const offers = await Offer.find({
    restaurant: req.restaurant._id,
    isActive: true,
    $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
  }).sort({ createdAt: -1 });

  res.json({ offers });
}
