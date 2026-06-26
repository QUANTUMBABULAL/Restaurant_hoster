import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, ShoppingCart, Plus, Minus, X, Leaf, Flame,
  Clock, CheckCircle2, UtensilsCrossed, Tag,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { formatPrice, getImageUrl } from '../../services/api';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../../services/socket';
import StatusBadge, { STATUS_CONFIG } from '../../components/ui/StatusBadge';

const publicApi = axios.create({ baseURL: '/api/public' });

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const restaurantSlug = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');

  const [restaurant, setRestaurant] = useState(null);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [customerNote, setCustomerNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);

  useEffect(() => {
    if (!restaurantSlug || !tableNumber) {
      setError('Invalid QR code. Please scan a valid table QR code.');
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [restRes, tableRes, catRes, menuRes, offerRes] = await Promise.all([
          publicApi.get(`/restaurant/${restaurantSlug}`),
          publicApi.get(`/restaurant/${restaurantSlug}/table/${tableNumber}`),
          publicApi.get(`/restaurant/${restaurantSlug}/categories`),
          publicApi.get(`/restaurant/${restaurantSlug}/menu`),
          publicApi.get(`/restaurant/${restaurantSlug}/offers`),
        ]);
        setRestaurant(restRes.data.restaurant);
        setTable(tableRes.data.table);
        setCategories(catRes.data.categories);
        setItems(menuRes.data.items);
        setOffers(offerRes.data.offers);
      } catch {
        setError('Restaurant or table not found. Please check your QR code.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [restaurantSlug, tableNumber]);

  useEffect(() => {
    if (!activeOrder?._id) return;
    joinOrderRoom(activeOrder._id);
    const socket = getSocket();
    const handleStatus = ({ order }) => {
      setActiveOrder(order);
      if (order.status === 'ready') toast.success('Your order is ready!');
      if (order.status === 'served') toast.success('Enjoy your meal!');
    };
    socket.on('order-status', handleStatus);
    return () => {
      socket.off('order-status', handleStatus);
      leaveOrderRoom(activeOrder._id);
    };
  }, [activeOrder?._id]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || item.category._id === activeCategory;
      const matchFilter =
        filter === 'all' ||
        (filter === 'veg' && item.isVeg) ||
        (filter === 'nonveg' && !item.isVeg) ||
        (filter === 'featured' && item.isFeatured);
      return matchSearch && matchCategory && matchFilter;
    });
  }, [items, search, activeCategory, filter]);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added`, { duration: 1500 });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => c._id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    );
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const { data } = await publicApi.post('/orders', {
        restaurantSlug,
        tableNumber: parseInt(tableNumber, 10),
        items: cart.map((c) => ({ menuItemId: c._id, quantity: c.quantity })),
        customerNote,
      });
      setActiveOrder(data.order);
      setCart([]);
      setCustomerNote('');
      setCartOpen(false);
      setOrderTrackerOpen(true);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
        <div className="text-center max-w-sm">
          <UtensilsCrossed className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-surface-900 mb-2">Oops!</h1>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 pb-24">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {restaurant.logo ? (
              <img src={getImageUrl(restaurant.logo)} alt={restaurant.name} className="w-11 h-11 rounded-xl object-cover" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                {restaurant.name[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-bold text-surface-900">{restaurant.name}</h1>
              <p className="text-xs text-surface-500">Table {tableNumber} · {table.name}</p>
            </div>
            {activeOrder && (
              <button
                onClick={() => setOrderTrackerOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium"
              >
                Track Order
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Offers */}
        {offers.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {offers.map((offer) => (
              <div key={offer._id} className="flex-shrink-0 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl px-4 py-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4" />
                  <span className="font-semibold text-sm">{offer.title}</span>
                </div>
                <p className="text-xs text-white/80">{offer.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              className="input pl-9"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'veg', 'nonveg', 'featured'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize ${
                filter === f ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-600'
              }`}
            >
              {f === 'nonveg' ? 'Non-Veg' : f}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
              activeCategory === 'all' ? 'bg-surface-900 text-white' : 'bg-white border border-surface-200 text-surface-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                activeCategory === cat._id ? 'bg-surface-900 text-white' : 'bg-white border border-surface-200 text-surface-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-center text-surface-500 py-12">No items found</p>
          ) : (
            filteredItems.map((item) => (
              <div key={item._id} className="card p-4 flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-surface-100 flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UtensilsCrossed className="w-8 h-8 text-surface-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-surface-900">{item.name}</h3>
                        {item.isVeg ? (
                          <Leaf className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Flame className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">{item.category?.name}</p>
                    </div>
                    <span className="font-bold text-surface-900 whitespace-nowrap">{formatPrice(item.price)}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-surface-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.prepTime} min
                    </span>
                    <button onClick={() => addToCart(item)} className="btn-primary text-xs px-3 py-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setCartOpen(true)}
              className="w-full bg-brand-600 text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-elevated hover:bg-brand-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
                <span className="font-medium">View Cart</span>
              </div>
              <span className="font-bold">{formatPrice(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-surface-900/50" onClick={() => setCartOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-surface-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(item._id, -1)} className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)} className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div>
                <label className="label">Special Instructions (optional)</label>
                <textarea
                  className="input"
                  rows={2}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Any special requests..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">{formatPrice(cartTotal)}</span>
              </div>
              <button onClick={placeOrder} className="btn-primary w-full py-3" disabled={placing}>
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracker */}
      {orderTrackerOpen && activeOrder && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-surface-900/50" onClick={() => setOrderTrackerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-surface-900">Order Placed!</h2>
              <p className="text-surface-500 text-sm mt-1">#{activeOrder.orderNumber}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-surface-700">Status</span>
                <StatusBadge status={activeOrder.status} />
              </div>
              <div className="space-y-2">
                {['pending', 'accepted', 'preparing', 'ready', 'served'].map((status) => {
                  const statusOrder = ['pending', 'accepted', 'preparing', 'ready', 'served'];
                  const currentIdx = statusOrder.indexOf(activeOrder.status);
                  const stepIdx = statusOrder.indexOf(status);
                  const isComplete = stepIdx <= currentIdx;
                  const isCurrent = status === activeOrder.status;

                  return (
                    <div key={status} className={`flex items-center gap-3 p-2 rounded-lg ${isCurrent ? 'bg-brand-50' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isComplete ? 'bg-brand-600 text-white' : 'bg-surface-200 text-surface-400'
                      }`}>
                        {isComplete ? '✓' : stepIdx + 1}
                      </div>
                      <span className={`text-sm capitalize ${isComplete ? 'text-surface-900 font-medium' : 'text-surface-400'}`}>
                        {STATUS_CONFIG[status]?.label || status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => setOrderTrackerOpen(false)} className="btn-secondary w-full">
              Continue Browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
