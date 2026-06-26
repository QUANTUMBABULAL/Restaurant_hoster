import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatPrice } from '../../services/api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

const emptyForm = {
  title: '', description: '', discountType: 'percentage',
  discountValue: '', minOrderAmount: '', validUntil: '',
};

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers');
      setOffers(data.offers);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (offer) => {
    setEditing(offer);
    setForm({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minOrderAmount: offer.minOrderAmount,
      validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/offers/${editing._id}`, form);
        setOffers((prev) => prev.map((o) => (o._id === editing._id ? data.offer : o)));
        toast.success('Offer updated');
      } else {
        const { data } = await api.post('/offers', form);
        setOffers((prev) => [data.offer, ...prev]);
        toast.success('Offer created');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await api.delete(`/offers/${id}`);
      setOffers((prev) => prev.filter((o) => o._id !== id));
      toast.success('Offer deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (offer) => {
    try {
      const { data } = await api.put(`/offers/${offer._id}`, { isActive: !offer.isActive });
      setOffers((prev) => prev.map((o) => (o._id === offer._id ? data.offer : o)));
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Offers</h1>
          <p className="text-surface-500 mt-1">Create promotions for customers</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <EmptyState icon={Tag} title="No offers" description="Create offers to attract more customers." action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Offer</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div key={offer._id} className={`card p-5 ${!offer.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-surface-900">{offer.title}</h3>
                  <p className="text-sm text-surface-500 mt-1">{offer.description}</p>
                </div>
                <span className="px-2.5 py-1 bg-brand-50 text-brand-700 text-sm font-bold rounded-lg">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `${formatPrice(offer.discountValue)} OFF`}
                </span>
              </div>
              {offer.minOrderAmount > 0 && (
                <p className="text-xs text-surface-400 mb-3">Min order: {formatPrice(offer.minOrderAmount)}</p>
              )}
              <div className="flex items-center justify-between">
                <button onClick={() => toggleActive(offer)} className={`text-xs font-medium px-2 py-1 rounded ${offer.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>
                  {offer.isActive ? 'Active' : 'Inactive'}
                </button>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(offer)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(offer._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Offer' : 'Add Offer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Discount Type</label>
              <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="label">Discount Value</label>
              <input type="number" className="input" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required min="0" />
            </div>
          </div>
          <div>
            <label className="label">Valid Until (optional)</label>
            <input type="date" className="input" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
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
