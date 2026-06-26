import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">DineFlow</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Manage your restaurant smarter</h2>
          <p className="text-white/60 leading-relaxed">
            Create your digital menu, generate QR codes for tables, and receive orders in real-time — all from one beautiful dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">DineFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-surface-900 mb-1">Welcome back</h1>
          <p className="text-surface-500 mb-8">Sign in to your restaurant dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@restaurant.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Register your restaurant</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
