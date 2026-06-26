import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    prepTime: { type: Number, default: 15 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('MenuItem', menuItemSchema);
