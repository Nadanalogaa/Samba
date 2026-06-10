import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit, X, Check, AlertCircle, Users, ChevronDown, Filter } from 'lucide-react';
import { customerApi, configApi } from '../../services/cashBillApi';

interface Customer {
  id: number; customer_code: string; customer_name: string; district_code: string;
  customer_type: string; discount_percent: number; contact_person: string; phone: string;
  address1: string; address2: string; pin_code: string; email: string; is_active: boolean;
  type_name: string;
}

interface DiscountType { type_code: string; type_name: string; discount_percent: number; }

interface FormData {
  customer_code: string; customer_name: string; district_code: string; customer_type: string;
  contact_person: string; phone: string; address1: string; address2: string; pin_code: string; email: string;
}

const emptyForm: FormData = {
  customer_code: '', customer_name: '', district_code: '', customer_type: 'D',
  contact_person: '', phone: '', address1: '', address2: '', pin_code: '', email: '',
};

export default function CustomerMasterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [saving, setSaving] = useState(false);

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
      if (filterDistrict) params.district = filterDistrict;
      if (filterType) params.type = filterType;
      const [custRes, discRes] = await Promise.all([customerApi.list(params), configApi.discounts()]);
      setCustomers(Array.isArray(custRes) ? custRes : []);
      setDiscountTypes(Array.isArray(discRes) ? discRes : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [search, filterDistrict, filterType]);

  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFormErrors({}); setModalOpen(true); };

  const openEdit = (c: Customer) => {
    setEditId(c.id);
    setForm({
      customer_code: c.customer_code, customer_name: c.customer_name, district_code: c.district_code,
      customer_type: c.customer_type, contact_person: c.contact_person || '', phone: c.phone || '',
      address1: c.address1 || '', address2: c.address2 || '', pin_code: c.pin_code || '', email: c.email || '',
    });
    setFormErrors({}); setModalOpen(true);
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.customer_code.trim()) errs.customer_code = 'Required';
    if (!form.customer_name.trim()) errs.customer_name = 'School/Customer name is required';
    if (!form.district_code) errs.district_code = 'Required';
    if (!form.customer_type) errs.customer_type = 'Required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editId) {
        await customerApi.update(editId, form);
        showToast('success', 'Customer updated');
      } else {
        await customerApi.create(form);
        showToast('success', 'Customer added');
      }
      setModalOpen(false); loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-accent-500' : 'bg-danger-500'}`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>Customer Master</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Manage schools and walk-in customers with discount types</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold shadow-sm">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-3 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, code..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" style={inputStyle} />
        </div>
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} className="px-3 py-2 rounded-xl border text-sm" style={inputStyle}>
          <option value="">All Districts</option>
          <option value="CHE">CHE - Chennai</option>
          <option value="CBE">CBE - Coimbatore</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 rounded-xl border text-sm" style={inputStyle}>
          <option value="">All Types</option>
          {discountTypes.map(t => <option key={t.type_code} value={t.type_code}>{t.type_code} - {t.type_name} ({t.discount_percent}%)</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Loading...</div>
        ) : error ? (
          <div className="p-8 text-center"><AlertCircle size={20} className="text-danger-500 mx-auto mb-2" /><p className="text-sm text-danger-600">{error}</p></div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center"><Users size={32} className="mx-auto mb-2" style={{ color: 'var(--theme-text-secondary)' }} /><p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>No customers found</p></div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text-secondary)' }}>
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">School / Customer Name</th>
                <th className="text-center px-4 py-3 font-medium">District</th>
                <th className="text-center px-4 py-3 font-medium">Type</th>
                <th className="text-right px-4 py-3 font-medium">Discount%</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-center px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50/50" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                  <td className="px-4 py-3 font-semibold text-primary-500 font-mono">{c.customer_code}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate">{c.customer_name}</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] font-bold">{c.district_code}</span></td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-full bg-info-100 text-info-700 text-[10px] font-semibold">{c.customer_type} - {c.type_name || ''}</span></td>
                  <td className="px-4 py-3 text-right font-bold">{Number(c.discount_percent || 0).toFixed(1)}%</td>
                  <td className="px-4 py-3" style={{ color: 'var(--theme-text-secondary)' }}>{c.contact_person || '-'}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--theme-text-secondary)' }}>{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.is_active ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600"><Edit size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl shadow-xl border p-6 max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{editId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Customer Code *</label>
                  <input value={form.customer_code} onChange={e => setForm(f => ({ ...f, customer_code: e.target.value }))} disabled={!!editId}
                    className="w-full px-3 py-2 rounded-xl border text-sm disabled:opacity-50" style={{ ...inputStyle, borderColor: formErrors.customer_code ? '#ef4444' : 'var(--theme-border)' }} placeholder="e.g. C0008" />
                  {formErrors.customer_code && <p className="text-[10px] text-danger-500 mt-0.5">{formErrors.customer_code}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>District *</label>
                  <select value={form.district_code} onChange={e => setForm(f => ({ ...f, district_code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ ...inputStyle, borderColor: formErrors.district_code ? '#ef4444' : 'var(--theme-border)' }}>
                    <option value="">Select</option>
                    <option value="CHE">CHE - Chennai</option>
                    <option value="CBE">CBE - Coimbatore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>School / Customer Name *</label>
                <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ ...inputStyle, borderColor: formErrors.customer_name ? '#ef4444' : 'var(--theme-border)' }} placeholder="School or customer name" />
                {formErrors.customer_name && <p className="text-[10px] text-danger-500 mt-0.5">{formErrors.customer_name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Customer Type * (Discount)</label>
                  <select value={form.customer_type} onChange={e => setForm(f => ({ ...f, customer_type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle}>
                    {discountTypes.map(t => <option key={t.type_code} value={t.type_code}>{t.type_code} - {t.type_name} ({t.discount_percent}%)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Pin Code</label>
                  <input value={form.pin_code} onChange={e => setForm(f => ({ ...f, pin_code: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="600001" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Address Line 1</label>
                <input value={form.address1} onChange={e => setForm(f => ({ ...f, address1: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="Street, Area" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Address Line 2</label>
                <input value={form.address2} onChange={e => setForm(f => ({ ...f, address2: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="City, State" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Contact Person</label>
                  <input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="9876543210" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={inputStyle} placeholder="email@school.com" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-semibold disabled:opacity-50">{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
