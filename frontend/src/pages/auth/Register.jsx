import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', restaurantName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Restaurant created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">DineFlow</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Launch your digital menu in minutes</h2>
          <p className="text-white/80 leading-relaxed">
            Register your restaurant, set up your menu, print QR codes, and start accepting orders today.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Create your account</h1>
          <p className="text-surface-500 mb-8">Set up your restaurant workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Your Name</label>
              <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </div>
            <div>
              <label className="label">Restaurant Name</label>
              <input name="restaurantName" className="input" value={form.restaurantName} onChange={handleChange} placeholder="The Spice Kitchen" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" value={form.email} onChange={handleChange} placeholder="owner@restaurant.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" minLength={6} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
