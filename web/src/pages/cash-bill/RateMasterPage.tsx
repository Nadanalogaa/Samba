import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  BookOpen,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { rateMasterApi } from '../../services/cashBillApi';
import ConfirmDialog from '../../components/cash-bill/ConfirmDialog';

interface RateItem {
  id: number;
  book_code: string;
  standard: string;
  title_name: string;
  short_title: string;
  rate: number;
  status: string;
}

interface FormData {
  book_code: string;
  standard: string;
  title_name: string;
  short_title: string;
  rate: string;
}

const emptyForm: FormData = {
  book_code: '',
  standard: '',
  title_name: '',
  short_title: '',
  rate: '',
};

export default function RateMasterPage() {
  const [items, setItems] = useState<RateItem[]>([]);
  const [standards, setStandards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStd, setFilterStd] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RateItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterStd) params.standard = filterStd;
      const [itemsRes, stdsRes] = await Promise.all([
        rateMasterApi.list(params),
        rateMasterApi.standards(),
      ]);
      setItems(Array.isArray(itemsRes) ? itemsRes : itemsRes.data || []);
      setStandards(Array.isArray(stdsRes) ? stdsRes : stdsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [search, filterStd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (item: RateItem) => {
    setEditId(item.id);
    setForm({
      book_code: item.book_code,
      standard: item.standard,
      title_name: item.title_name,
      short_title: item.short_title,
      rate: String(item.rate),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.book_code.trim()) errs.book_code = 'Required';
    if (!form.standard.trim()) errs.standard = 'Required';
    if (!form.title_name.trim()) errs.title_name = 'Required';
    if (!form.short_title.trim()) errs.short_title = 'Required';
    if (!form.rate.trim() || isNaN(Number(form.rate)) || Number(form.rate) <= 0) errs.rate = 'Valid rate required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        book_code: form.book_code.trim(),
        standard: form.standard.trim(),
        title_name: form.title_name.trim(),
        short_title: form.short_title.trim(),
        rate: Number(form.rate),
      };
      if (editId) {
        await rateMasterApi.update(editId, payload);
        showToast('success', 'Book updated successfully');
      } else {
        await rateMasterApi.create(payload);
        showToast('success', 'Book added successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: RateItem) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rateMasterApi.delete(deleteTarget.id);
      showToast('success', `Book "${deleteTarget.title_name}" deleted`);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Delete failed');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all duration-300 ${
            toast.type === 'success' ? 'bg-accent-500' : 'bg-danger-500'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--theme-text, #1f2937)' }}>
            Rate Master
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
            Manage book catalog and pricing
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm transition-colors duration-200"
        >
          <Plus size={16} />
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border"
        style={{
          backgroundColor: 'var(--theme-surface, #ffffff)',
          borderColor: 'var(--theme-border, #e5e7eb)',
        }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{
              backgroundColor: 'var(--theme-surface, #ffffff)',
              color: 'var(--theme-text, #1f2937)',
              borderColor: 'var(--theme-border, #d1d5db)',
            }}
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterStd}
            onChange={(e) => setFilterStd(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-lg border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{
              backgroundColor: 'var(--theme-surface, #ffffff)',
              color: 'var(--theme-text, #1f2937)',
              borderColor: 'var(--theme-border, #d1d5db)',
            }}
          >
            <option value="">All Standards</option>
            {standards.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-sm border overflow-hidden"
        style={{
          backgroundColor: 'var(--theme-surface, #ffffff)',
          borderColor: 'var(--theme-border, #e5e7eb)',
        }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <svg className="animate-spin w-6 h-6 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>Loading...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle size={24} className="text-danger-500 mx-auto mb-2" />
            <p className="text-sm text-danger-600">{error}</p>
            <button onClick={loadData} className="text-sm text-primary-600 underline mt-2">Retry</button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--theme-text-muted, #9ca3af)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>
              No books found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-muted, #9ca3af)' }}>
              Add your first book to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--theme-bg, #f9fafb)' }}>
                  {['Book Code', 'Standard', 'Title Name', 'Short Title', 'Rate', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider sticky top-0"
                      style={{ color: 'var(--theme-text-muted, #6b7280)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50/50 transition-colors duration-100"
                    style={{
                      borderColor: 'var(--theme-border, #e5e7eb)',
                      backgroundColor: idx % 2 === 1 ? 'var(--theme-bg, #f9fafb)' : undefined,
                    }}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-primary-600">{item.book_code}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--theme-text, #1f2937)' }}>{item.standard}</td>
                    <td className="px-4 py-3 max-w-[250px] truncate" style={{ color: 'var(--theme-text, #1f2937)' }}>
                      {item.title_name}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--theme-text-muted, #6b7280)' }}>{item.short_title}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--theme-text, #1f2937)' }}>
                      {'\u20B9'}{item.rate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-accent-100 text-accent-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div
            className="relative w-full max-w-lg rounded-2xl shadow-xl border p-6"
            style={{
              backgroundColor: 'var(--theme-surface, #ffffff)',
              borderColor: 'var(--theme-border, #e5e7eb)',
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text, #1f2937)' }}>
                {editId ? 'Edit Book' : 'Add Book'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--theme-text-muted, #6b7280)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Book Code */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text, #1f2937)' }}>
                  Book Code *
                </label>
                <input
                  type="text"
                  value={form.book_code}
                  onChange={(e) => setForm((f) => ({ ...f, book_code: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: formErrors.book_code ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                  placeholder="e.g., BK001"
                />
                {formErrors.book_code && <p className="text-xs text-danger-500 mt-1">{formErrors.book_code}</p>}
              </div>

              {/* Standard */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text, #1f2937)' }}>
                  Standard *
                </label>
                <input
                  type="text"
                  value={form.standard}
                  onChange={(e) => setForm((f) => ({ ...f, standard: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: formErrors.standard ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                  placeholder="e.g., 1st, 2nd, LKG"
                />
                {formErrors.standard && <p className="text-xs text-danger-500 mt-1">{formErrors.standard}</p>}
              </div>

              {/* Title Name */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text, #1f2937)' }}>
                  Title Name *
                </label>
                <input
                  type="text"
                  value={form.title_name}
                  onChange={(e) => setForm((f) => ({ ...f, title_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: formErrors.title_name ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                  placeholder="Full book title"
                />
                {formErrors.title_name && <p className="text-xs text-danger-500 mt-1">{formErrors.title_name}</p>}
              </div>

              {/* Short Title */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text, #1f2937)' }}>
                  Short Title *
                </label>
                <input
                  type="text"
                  value={form.short_title}
                  onChange={(e) => setForm((f) => ({ ...f, short_title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: formErrors.short_title ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                  placeholder="Short display title"
                />
                {formErrors.short_title && <p className="text-xs text-danger-500 mt-1">{formErrors.short_title}</p>}
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--theme-text, #1f2937)' }}>
                  Rate ({'\u20B9'}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{
                    backgroundColor: 'var(--theme-surface, #ffffff)',
                    color: 'var(--theme-text, #1f2937)',
                    borderColor: formErrors.rate ? '#ef4444' : 'var(--theme-border, #d1d5db)',
                  }}
                  placeholder="0.00"
                />
                {formErrors.rate && <p className="text-xs text-danger-500 mt-1">{formErrors.rate}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--theme-border, #e5e7eb)' }}>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
                style={{
                  color: 'var(--theme-text, #1f2937)',
                  borderColor: 'var(--theme-border, #d1d5db)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : editId ? 'Update' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="Delete this book?"
        message={
          deleteTarget ? (
            <div className="space-y-2">
              <p>The book will be deactivated and hidden from order entry. Existing bills that reference this book are not affected.</p>
              <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
                <div className="flex justify-between"><span>Code</span><strong className="font-mono text-primary-500">{deleteTarget.book_code}</strong></div>
                <div className="flex justify-between"><span>Title</span><strong>{deleteTarget.title_name}</strong></div>
                <div className="flex justify-between"><span>Standard</span><strong>{deleteTarget.standard}</strong></div>
              </div>
            </div>
          ) : ''
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
