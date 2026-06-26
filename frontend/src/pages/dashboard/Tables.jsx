import { useEffect, useState } from 'react';
import { Plus, Trash2, QrCode, Download, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [form, setForm] = useState({ name: '', tableNumber: '' });
  const [saving, setSaving] = useState(false);

  const fetchTables = async () => {
    try {
      const { data } = await api.get('/tables');
      setTables(data.tables);
    } catch {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/tables', form);
      setTables((prev) => [...prev, data.table].sort((a, b) => a.tableNumber - b.tableNumber));
      setModalOpen(false);
      setForm({ name: '', tableNumber: '' });
      toast.success('Table created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this table?')) return;
    try {
      await api.delete(`/tables/${id}`);
      setTables((prev) => prev.filter((t) => t._id !== id));
      toast.success('Table deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const showQR = async (table) => {
    try {
      const { data } = await api.get(`/tables/${table._id}/qr`);
      setQrModal(data);
    } catch {
      toast.error('Failed to generate QR');
    }
  };

  const downloadQR = async (tableId) => {
    try {
      const { data } = await api.get(`/tables/${tableId}/qr/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download QR');
    }
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>Table QR Code</title>
      <style>body{text-align:center;font-family:sans-serif;padding:40px}h2{margin-bottom:8px}p{color:#666;margin-bottom:24px}img{width:300px;height:300px}</style>
      </head><body>
      <h2>${qrModal.table.name}</h2>
      <p>Scan to order from your table</p>
      <img src="${qrModal.qrDataUrl}" />
      <p style="font-size:12px;margin-top:16px">${qrModal.qrUrl}</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tables</h1>
          <p className="text-surface-500 mt-1">Manage tables and QR codes</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Table
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tables.length === 0 ? (
        <EmptyState icon={QrCode} title="No tables yet" description="Create tables and generate QR codes for customers to scan and order." action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Table</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <div key={table._id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-surface-900">{table.name}</h3>
                  <p className="text-sm text-surface-500">Table #{table.tableNumber}</p>
                </div>
                <button onClick={() => handleDelete(table._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => showQR(table)} className="btn-secondary flex-1 text-xs">
                  <QrCode className="w-3.5 h-3.5" /> View QR
                </button>
                <button onClick={() => downloadQR(table._id)} className="btn-ghost p-2">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Table">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Table Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Table 1" required />
          </div>
          <div>
            <label className="label">Table Number</label>
            <input type="number" className="input" value={form.tableNumber} onChange={(e) => setForm({ ...form, tableNumber: e.target.value })} placeholder="1" required min="1" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Table'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title="Table QR Code">
        {qrModal && (
          <div className="text-center">
            <p className="font-semibold text-surface-900 mb-1">{qrModal.table.name}</p>
            <p className="text-sm text-surface-500 mb-6">Customers scan this to order</p>
            <img src={qrModal.qrDataUrl} alt="QR Code" className="mx-auto w-64 h-64 rounded-xl border border-surface-200" />
            <p className="text-xs text-surface-400 mt-4 break-all">{qrModal.qrUrl}</p>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => downloadQR(qrModal.table._id)} className="btn-secondary">
                <Download className="w-4 h-4" /> Download
              </button>
              <button onClick={printQR} className="btn-primary">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
