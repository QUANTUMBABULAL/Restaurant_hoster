import { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatPrice } from '../../services/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/analytics')
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders (30d)', value: analytics.totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Revenue (30d)', value: formatPrice(analytics.totalRevenue), icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Avg Order Value', value: formatPrice(analytics.avgOrderValue), icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  const maxRevenue = Math.max(...Object.values(analytics.dailyRevenue), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Analytics</h1>
        <p className="text-surface-500 mt-1">Last 30 days performance</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-surface-900">{value}</p>
            <p className="text-sm text-surface-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 mb-4">Daily Revenue</h2>
          {Object.keys(analytics.dailyRevenue).length === 0 ? (
            <p className="text-surface-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(analytics.dailyRevenue).slice(-7).map(([day, revenue]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-xs text-surface-500 w-20">{day.slice(5)}</span>
                  <div className="flex-1 bg-surface-100 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${(revenue / maxRevenue) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium w-16 text-right">{formatPrice(revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-surface-900 mb-4">Top Items</h2>
          {analytics.topItems.length === 0 ? (
            <p className="text-surface-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topItems.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-sm font-medium text-surface-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.quantity} sold</p>
                    <p className="text-xs text-surface-500">{formatPrice(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
