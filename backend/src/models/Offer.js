import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Offer', offerSchema);
