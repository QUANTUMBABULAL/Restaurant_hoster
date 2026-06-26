import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Restaurant', restaurantSchema);
