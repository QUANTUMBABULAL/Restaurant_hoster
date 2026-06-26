import { useEffect, useState } from 'react';
import { ShoppingBag, UtensilsCrossed, FolderOpen, QrCode, TrendingUp, Clock } from 'lucide-react';
import api, { formatPrice } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import { getSocket, joinRestaurantRoom } from '../../services/socket';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { restaurant } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/restaurant/dashboard');
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (restaurant?.id) {
      joinRestaurantRoom(restaurant.id);
      const socket = getSocket();
      socket.on('new-order', (order) => {
        toast.success(`New order #${order.orderNumber}!`, { icon: '🔔' });
        fetchData();
      });
      return () => socket.off('new-order');
    }
  }, [restaurant?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Today\'s Orders', value: stats.todayOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Today\'s Revenue', value: formatPrice(stats.todayRevenue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Menu Items', value: stats.menuItems, icon: UtensilsCrossed, color: 'bg-purple-50 text-purple-600' },
    { label: 'Categories', value: stats.categories, icon: FolderOpen, color: 'bg-rose-50 text-rose-600' },
    { label: 'Tables', value: stats.tables, icon: QrCode, color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-500 mt-1">Welcome back to {restaurant?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-surface-900">{value}</p>
            <p className="text-sm text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="font-semibold text-surface-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center text-surface-500 py-12">No orders yet. Share your QR codes to get started!</p>
        ) : (
          <div className="divide-y divide-surface-100">
            {recentOrders.map((order) => (
              <div key={order._id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-surface-900">#{order.orderNumber}</p>
                  <p className="text-sm text-surface-500">Table {order.tableNumber} · {order.items.length} items</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-surface-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
