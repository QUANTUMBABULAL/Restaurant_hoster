import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { generateSlug, ensureUniqueSlug } from '../utils/helpers.js';

export async function register(req, res) {
  const { name, email, password, restaurantName } = req.body;

  if (!name || !email || !password || !restaurantName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const baseSlug = generateSlug(restaurantName);
  const slug = await ensureUniqueSlug(baseSlug, Restaurant);

  const restaurant = await Restaurant.create({
    name: restaurantName,
    slug,
  });

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    restaurant: restaurant._id,
    role: 'owner',
    authProvider: 'local',
  });

  const token = signToken({
    userId: user._id,
    restaurantId: restaurant._id,
    email: user.email,
  });

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    restaurant: {
      id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).populate('restaurant');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken({
    userId: user._id,
    restaurantId: user.restaurant._id,
    email: user.email,
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    restaurant: {
      id: user.restaurant._id,
      name: user.restaurant.name,
      slug: user.restaurant.slug,
      logo: user.restaurant.logo,
    },
  });
}

export async function getMe(req, res) {
  const user = req.user;
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    restaurant: {
      id: user.restaurant._id,
      name: user.restaurant.name,
      slug: user.restaurant.slug,
      logo: user.restaurant.logo,
      description: user.restaurant.description,
      address: user.restaurant.address,
      phone: user.restaurant.phone,
      currency: user.restaurant.currency,
    },
  });
}
