import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatPrice } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge, { STATUS_CONFIG } from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { getSocket, joinRestaurantRoom } from '../../services/socket';

const STATUS_FLOW = ['pending', 'accepted', 'preparing', 'ready', 'served'];

export default function Orders() {
  const { restaurant } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await api.get('/orders', { params });
      setOrders(data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (restaurant?.id) {
      joinRestaurantRoom(restaurant.id);
      const socket = getSocket();
      const handleNew = (order) => {
        setOrders((prev) => [order, ...prev]);
        toast.success(`New order #${order.orderNumber}!`);
      };
      const handleUpdate = (order) => {
        setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
        if (selectedOrder?._id === order._id) setSelectedOrder(order);
      };
      socket.on('new-order', handleNew);
      socket.on('order-updated', handleUpdate);
      return () => {
        socket.off('new-order', handleNew);
        socket.off('order-updated', handleUpdate);
      };
    }
  }, [restaurant?.id, filter]);

  const updateStatus = async (orderId, status) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
      setSelectedOrder(data.order);
      toast.success(`Order marked as ${STATUS_CONFIG[status].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filters = ['all', ...Object.keys(STATUS_CONFIG)];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Orders</h1>
        <p className="text-surface-500 mt-1">Manage incoming orders in real-time</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders will appear here when customers scan your QR codes and place orders." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {orders.map((order) => (
              <button
                key={order._id}
                onClick={() => setSelectedOrder(order)}
                className={`card w-full p-4 text-left transition-all hover:shadow-md ${
                  selectedOrder?._id === order._id ? 'ring-2 ring-brand-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-surface-900">#{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-sm text-surface-500">Table {order.tableNumber} · {order.items.length} items</p>
                <p className="text-sm font-medium text-surface-900 mt-1">{formatPrice(order.total)}</p>
              </button>
            ))}
          </div>

          {selectedOrder && (
            <div className="card p-6 sticky top-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">#{selectedOrder.orderNumber}</h2>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <p className="text-sm text-surface-500 mb-4">Table {selectedOrder.tableNumber} · {selectedOrder.tableName}</p>

              <div className="space-y-3 mb-6">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-surface-700">{item.quantity}x {item.name}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <p className="text-sm text-surface-500 mb-4 bg-surface-50 p-3 rounded-lg">
                  Note: {selectedOrder.customerNote}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-700 mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder._id, status)}
                      disabled={selectedOrder.status === status}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-brand-600 text-white'
                          : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    onClick={() => updateStatus(selectedOrder._id, 'cancelled')}
                    className="col-span-2 px-3 py-2 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Cancel Order
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
