import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    tableNumber: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model('Table', tableSchema);
