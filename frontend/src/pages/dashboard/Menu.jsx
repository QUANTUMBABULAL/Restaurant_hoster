import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatPrice, getImageUrl } from '../../services/api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = {
  name: '', description: '', price: '', category: '', isVeg: true,
  isAvailable: true, prepTime: 15, isFeatured: false, image: null,
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories'),
      ]);
      setItems(menuRes.data.items);
      setCategories(catRes.data.categories);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setPreview(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category._id || item.category,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      prepTime: item.prepTime,
      isFeatured: item.isFeatured,
      image: null,
    });
    setPreview(getImageUrl(item.image));
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'image' && val) fd.append('image', val);
      else if (key !== 'image') fd.append(key, val);
    });

    try {
      if (editing) {
        const { data } = await api.put(`/menu/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems((prev) => prev.map((i) => (i._id === editing._id ? data.item : i)));
        toast.success('Item updated');
      } else {
        const { data } = await api.post('/menu', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems((prev) => [data.item, ...prev]);
        toast.success('Item created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Menu</h1>
          <p className="text-surface-500 mt-1">Manage your food items</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menu items"
          description="Add your first food item to get started."
          action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Item</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="card overflow-hidden group">
              <div className="aspect-[4/3] bg-surface-100 relative">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed className="w-10 h-10 text-surface-300" />
                  </div>
                )}
                {item.isFeatured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-medium rounded-full">Featured</span>
                )}
                {!item.isAvailable && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded-full">Unavailable</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-surface-900">{item.name}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{item.category?.name}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                  </span>
                </div>
                <p className="text-sm text-surface-500 mt-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-surface-900">{formatPrice(item.price)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prep Time (mins)</label>
              <input type="number" className="input" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} min="1" />
            </div>
          </div>
          <div>
            <label className="label">Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="input" />
            {preview && <img src={preview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="rounded" />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="rounded" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
              Featured
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Item'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
