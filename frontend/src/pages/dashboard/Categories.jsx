import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setName(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setName(cat.name); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/categories/${editing._id}`, { name });
        setCategories((prev) => prev.map((c) => (c._id === editing._id ? data.category : c)));
        toast.success('Category updated');
      } else {
        const { data } = await api.post('/categories', { name });
        setCategories((prev) => [...prev, data.category]);
        toast.success('Category created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const presets = ['Starters', 'Main Course', 'Desserts', 'Drinks'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Categories</h1>
          <p className="text-surface-500 mt-1">Organize your menu</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="mb-6">
          <p className="text-sm text-surface-500 mb-3">Quick add popular categories:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={async () => {
                  try {
                    const { data } = await api.post('/categories', { name: p });
                    setCategories((prev) => [...prev, data.category]);
                    toast.success(`${p} added`);
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed');
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-sm bg-surface-100 text-surface-700 hover:bg-surface-200"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No categories" description="Create categories to organize your menu items." action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Category</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-brand-600" />
                </div>
                <span className="font-medium text-surface-900">{cat.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Starters" required />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
