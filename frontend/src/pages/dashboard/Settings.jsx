import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { restaurant, loadUser } = useAuth();
  const [form, setForm] = useState({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    currency: restaurant?.currency || 'INR',
  });
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(getImageUrl(restaurant?.logo));
  const [saving, setSaving] = useState(false);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => fd.append(key, val));
    if (logo) fd.append('logo', logo);

    try {
      await api.put('/restaurant/settings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadUser();
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Settings</h1>
        <p className="text-surface-500 mt-1">Manage your restaurant profile</p>
      </div>

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-surface-100 overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-surface-300">{form.name?.[0]}</span>
              )}
            </div>
            <div>
              <label className="label">Restaurant Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
            </div>
          </div>

          <div>
            <label className="label">Restaurant Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm text-surface-500 mb-2">Restaurant URL slug: <code className="bg-surface-100 px-1.5 py-0.5 rounded text-brand-600">{restaurant?.slug}</code></p>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
