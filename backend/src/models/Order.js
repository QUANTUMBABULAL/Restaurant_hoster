import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    isVeg: { type: Boolean, default: true },
    image: { type: String, default: '' },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    tableNumber: { type: Number, required: true },
    tableName: { type: String, default: '' },
    orderNumber: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'pending',
    },
    customerNote: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
