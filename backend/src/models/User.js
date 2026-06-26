import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    role: { type: String, enum: ['owner', 'staff'], default: 'owner' },
    // Reserved for future OAuth providers
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    googleId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
