import { useState, useEffect } from 'react';
import { Settings, Save, Building2 } from 'lucide-react';
import { configApi } from '../../services/cashBillApi';

interface DiscountType { type_code: string; type_name: string; discount_percent: number; description: string; is_active: boolean; }
interface Company { name: string; address1: string; address2: string; gstin: string; stateCode: string; hsnCodes: string[]; phone: string; email: string; }

export default function CashSettingsPage() {
  const [discounts, setDiscounts] = useState<DiscountType[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [editing, setEditing] = useState<Record<string, DiscountType>>({});
  const [saving, setSaving] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    configApi.discounts().then(setDiscounts).catch(() => {});
    configApi.company().then(setCompany).catch(() => {});
  }, []);

  const startEdit = (d: DiscountType) => setEditing({ ...editing, [d.type_code]: { ...d } });

  const saveDiscount = async (code: string) => {
    setSaving(code);
    try {
      const d = editing[code];
      await configApi.updateDiscount(code, d);
      setDiscounts(discounts.map(dd => dd.type_code === code ? { ...dd, ...d } : dd));
      const { [code]: _, ...rest } = editing;
      setEditing(rest);
      setMsg(`Type ${code} updated successfully`);
      setTimeout(() => setMsg(''), 2000);
    } catch (err: any) {
      setMsg(err.message);
    }
    setSaving('');
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--theme-text)' }}>Settings</h1>

      {msg && <div className="p-3 mb-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-600">{msg}</div>}

      {/* Discount Configuration */}
      <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-primary-500" />
          <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Discount Configuration</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--theme-text-secondary)' }}>
          Configure discount percentages for each customer type. Changes will apply to new orders.
        </p>

        <table className="w-full text-xs">
          <thead>
            <tr style={{ color: 'var(--theme-text-secondary)' }}>
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Type Name</th>
              <th className="text-right py-2">Discount %</th>
              <th className="text-left py-2 pl-4">Description</th>
              <th className="text-center py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(d => {
              const ed = editing[d.type_code];
              return (
                <tr key={d.type_code} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                  <td className="py-3 font-bold text-primary-500">{d.type_code}</td>
                  <td className="py-3">
                    {ed ? (
                      <input value={ed.type_name} onChange={e => setEditing({ ...editing, [d.type_code]: { ...ed, type_name: e.target.value } })}
                        className="px-2 py-1 rounded border text-xs w-28" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                    ) : d.type_name}
                  </td>
                  <td className="py-3 text-right">
                    {ed ? (
                      <input type="number" value={ed.discount_percent} onChange={e => setEditing({ ...editing, [d.type_code]: { ...ed, discount_percent: +e.target.value } })}
                        className="px-2 py-1 rounded border text-xs w-16 text-right" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} min={0} max={50} step={0.5} />
                    ) : <span className="font-bold">{d.discount_percent}%</span>}
                  </td>
                  <td className="py-3 pl-4">
                    {ed ? (
                      <input value={ed.description} onChange={e => setEditing({ ...editing, [d.type_code]: { ...ed, description: e.target.value } })}
                        className="px-2 py-1 rounded border text-xs w-full" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                    ) : <span style={{ color: 'var(--theme-text-secondary)' }}>{d.description}</span>}
                  </td>
                  <td className="py-3 text-center">
                    {ed ? (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => saveDiscount(d.type_code)} disabled={saving === d.type_code}
                          className="p-1.5 rounded-lg text-accent-500 hover:bg-accent-50"><Save size={13} /></button>
                        <button onClick={() => { const { [d.type_code]: _, ...rest } = editing; setEditing(rest); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 text-xs">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(d)} className="px-2 py-1 rounded-lg text-xs font-medium text-primary-500 hover:bg-primary-50">Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Company Info */}
      {company && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-primary-500" />
            <h2 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Company Information</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            {[
              { label: 'Company Name', value: company.name },
              { label: 'Address', value: `${company.address1}, ${company.address2}` },
              { label: 'GSTIN', value: company.gstin },
              { label: 'State Code', value: company.stateCode },
              { label: 'HSN Codes', value: company.hsnCodes.join(', ') },
              { label: 'Phone', value: company.phone },
              { label: 'Email', value: company.email },
            ].map(item => (
              <div key={item.label}>
                <p className="font-medium mb-0.5" style={{ color: 'var(--theme-text-secondary)' }}>{item.label}</p>
                <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
