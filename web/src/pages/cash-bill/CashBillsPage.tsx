import { useState, useEffect } from 'react';
import { Printer, FileText, Search } from 'lucide-react';
import { billApi } from '../../services/cashBillApi';

interface Bill { id: number; bill_no: string; bill_date: string; net_amount: number; district_code: string; total_qty: number; subtotal: number; discount_percent: number; discount_amount: number; customer_name: string; customer_code: string; print_count: number; }

export default function CashBillsPage() {
  const user = JSON.parse(localStorage.getItem('cash-bill-user') || '{}');
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState('');
  const [from, setFrom] = useState(new Date().toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { from, to };
      if (district) params.district = district;
      setBills(await billApi.list(params));
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [from, to, district]);

  const printBill = async (id: number) => {
    const blob = await billApi.pdf(id);
    const url = URL.createObjectURL(blob as Blob);
    window.open(url, '_blank');
    load(); // refresh print count
  };

  const totalAmt = bills.reduce((s, b) => s + +b.net_amount, 0);
  const totalQty = bills.reduce((s, b) => s + +b.total_qty, 0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Cash Bills</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'var(--theme-surface)' }} />
        </div>
        <div>
          <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'var(--theme-surface)' }} />
        </div>
        <div>
          <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>District</label>
          <select value={district} onChange={e => setDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl border text-xs" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'var(--theme-surface)' }}>
            <option value="">All</option>
            {user.districts?.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-3 text-xs" style={{ color: 'var(--theme-text)' }}>
          <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
            <span style={{ color: 'var(--theme-text-secondary)' }}>Bills:</span> <strong>{bills.length}</strong>
          </div>
          <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
            <span style={{ color: 'var(--theme-text-secondary)' }}>Qty:</span> <strong>{totalQty}</strong>
          </div>
          <div className="px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
            <span style={{ color: 'var(--theme-text-secondary)' }}>Total:</span> <strong className="text-primary-500">₹{totalAmt.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text-secondary)' }}>
              <th className="text-left px-4 py-3 font-medium">Bill No</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-center px-4 py-3 font-medium">District</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Gross</th>
              <th className="text-right px-4 py-3 font-medium">Discount</th>
              <th className="text-right px-4 py-3 font-medium">Net Amount</th>
              <th className="text-center px-4 py-3 font-medium">Prints</th>
              <th className="text-center px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>Loading...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>No bills found for this period</td></tr>
            ) : bills.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50/50" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                <td className="px-4 py-3 font-semibold text-primary-500">{b.bill_no}</td>
                <td className="px-4 py-3">{new Date(b.bill_date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">{b.customer_name || 'Walk-in'}</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] font-bold">{b.district_code}</span></td>
                <td className="px-4 py-3 text-right">{b.total_qty}</td>
                <td className="px-4 py-3 text-right">₹{(+b.subtotal).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-red-500">{+b.discount_amount > 0 ? `-₹${(+b.discount_amount).toFixed(2)}` : '-'}</td>
                <td className="px-4 py-3 text-right font-bold">₹{(+b.net_amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">{b.print_count}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => printBill(b.id)} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50" title="Print PDF">
                    <Printer size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
