const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Ready', color: 'bg-emerald-100 text-emerald-800' },
  served: { label: 'Served', color: 'bg-surface-100 text-surface-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
