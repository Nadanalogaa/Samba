import { useState, useEffect } from 'react';
import { Calendar, BarChart3, Users, BookOpen, MapPin } from 'lucide-react';
import { reportApi } from '../../services/cashBillApi';

type Tab = 'dayEnd' | 'billList' | 'customerWise' | 'bookWise' | 'districtComparison';

export default function CashReportsPage() {
  const user = JSON.parse(localStorage.getItem('cash-bill-user') || '{}');
  const [tab, setTab] = useState<Tab>('dayEnd');
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [district, setDistrict] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (district) params.district = district;
      switch (tab) {
        case 'dayEnd': params.date = date; setData(await reportApi.dayEnd(params)); break;
        case 'billList': params.from = from; params.to = to; setData(await reportApi.billList(params)); break;
        case 'customerWise': params.from = from; params.to = to; setData(await reportApi.customerWise(params)); break;
        case 'bookWise': params.from = from; params.to = to; setData(await reportApi.bookWise(params)); break;
        case 'districtComparison': params.from = from; params.to = to; setData(await reportApi.districtComparison(params)); break;
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab, date, from, to, district]);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'dayEnd', label: 'Day End', icon: Calendar },
    { key: 'billList', label: 'Bill List', icon: BarChart3 },
    { key: 'customerWise', label: 'Customer-wise', icon: Users },
    { key: 'bookWise', label: 'Book-wise', icon: BookOpen },
    { key: 'districtComparison', label: 'District', icon: MapPin },
  ];

  const inputCls = "px-3 py-2 rounded-xl border text-xs";
  const inputStyle = { borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'var(--theme-surface)' };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Reports</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setData(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.key ? 'bg-primary-500 text-white' : 'border'}`}
            style={tab !== t.key ? { borderColor: 'var(--theme-border)', color: 'var(--theme-text)' } : {}}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        {tab === 'dayEnd' ? (
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className={inputCls} style={inputStyle} />
            </div>
          </>
        )}
        {tab !== 'districtComparison' && (
          <div>
            <label className="block text-[10px] font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>District</label>
            <select value={district} onChange={e => setDistrict(e.target.value)} className={inputCls} style={inputStyle}>
              <option value="">All</option>
              {user.districts?.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Loading...</div>
      ) : !data ? null : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>

          {/* Day End */}
          {tab === 'dayEnd' && (
            <>
              <div className="grid grid-cols-3 gap-4 p-4" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
                {data.summary?.map((s: any) => (
                  <div key={s.district_code} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-surface)' }}>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--theme-text-secondary)' }}>{s.district_code}</p>
                    <p className="text-lg font-bold text-primary-500">₹{(+s.total_amount).toLocaleString()}</p>
                    <p className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>{s.bill_count} bills, {s.total_qty} copies</p>
                  </div>
                ))}
                {data.summary?.length === 0 && <p className="col-span-3 text-center text-xs py-4" style={{ color: 'var(--theme-text-secondary)' }}>No bills for this date</p>}
              </div>
              <table className="w-full text-xs">
                <thead><tr style={{ color: 'var(--theme-text-secondary)' }}><th className="text-left px-4 py-2">Bill No</th><th className="text-left px-4 py-2">Customer</th><th className="text-center px-4 py-2">District</th><th className="text-right px-4 py-2">Qty</th><th className="text-right px-4 py-2">Amount</th></tr></thead>
                <tbody>
                  {data.bills?.map((b: any) => (
                    <tr key={b.bill_no} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                      <td className="px-4 py-2 font-semibold text-primary-500">{b.bill_no}</td>
                      <td className="px-4 py-2">{b.customer_name || 'Walk-in'}</td>
                      <td className="px-4 py-2 text-center">{b.district_code}</td>
                      <td className="px-4 py-2 text-right">{b.total_qty}</td>
                      <td className="px-4 py-2 text-right font-bold">₹{(+b.net_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Bill List */}
          {tab === 'billList' && (
            <>
              <div className="p-3 text-xs flex gap-6" style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text)' }}>
                <span>Total Bills: <strong>{data.totals?.count}</strong></span>
                <span>Total Qty: <strong>{data.totals?.qty}</strong></span>
                <span>Total Amount: <strong className="text-primary-500">₹{data.totals?.amount?.toFixed(2)}</strong></span>
                <span>Total Discount: <strong className="text-red-500">₹{data.totals?.discount?.toFixed(2)}</strong></span>
              </div>
              <table className="w-full text-xs">
                <thead><tr style={{ color: 'var(--theme-text-secondary)' }}><th className="text-left px-4 py-2">Bill No</th><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Customer</th><th className="text-right px-4 py-2">Qty</th><th className="text-right px-4 py-2">Gross</th><th className="text-right px-4 py-2">Disc%</th><th className="text-right px-4 py-2">Net</th></tr></thead>
                <tbody>
                  {data.bills?.map((b: any) => (
                    <tr key={b.bill_no} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                      <td className="px-4 py-2 font-semibold text-primary-500">{b.bill_no}</td>
                      <td className="px-4 py-2">{new Date(b.bill_date).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-2">{b.customer_name || 'Walk-in'}</td>
                      <td className="px-4 py-2 text-right">{b.total_qty}</td>
                      <td className="px-4 py-2 text-right">₹{(+b.subtotal).toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{b.discount_percent}%</td>
                      <td className="px-4 py-2 text-right font-bold">₹{(+b.net_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Customer-wise */}
          {tab === 'customerWise' && (
            <table className="w-full text-xs">
              <thead><tr style={{ color: 'var(--theme-text-secondary)' }}><th className="text-left px-4 py-2">Code</th><th className="text-left px-4 py-2">Customer</th><th className="text-center px-4 py-2">Type</th><th className="text-center px-4 py-2">District</th><th className="text-right px-4 py-2">Bills</th><th className="text-right px-4 py-2">Qty</th><th className="text-right px-4 py-2">Gross</th><th className="text-right px-4 py-2">Discount</th><th className="text-right px-4 py-2">Net</th></tr></thead>
              <tbody>
                {(data as any[])?.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-6" style={{ color: 'var(--theme-text-secondary)' }}>No data</td></tr>
                ) : (data as any[])?.map((r: any) => (
                  <tr key={r.customer_code} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                    <td className="px-4 py-2 font-semibold">{r.customer_code}</td>
                    <td className="px-4 py-2">{r.customer_name}</td>
                    <td className="px-4 py-2 text-center">{r.customer_type}</td>
                    <td className="px-4 py-2 text-center">{r.district_code}</td>
                    <td className="px-4 py-2 text-right">{r.bill_count}</td>
                    <td className="px-4 py-2 text-right">{r.total_qty}</td>
                    <td className="px-4 py-2 text-right">₹{(+r.gross_amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-red-500">₹{(+r.total_discount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold">₹{(+r.net_amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Book-wise */}
          {tab === 'bookWise' && (
            <table className="w-full text-xs">
              <thead><tr style={{ color: 'var(--theme-text-secondary)' }}><th className="text-left px-4 py-2">Code</th><th className="text-left px-4 py-2">Title</th><th className="text-center px-4 py-2">Standard</th><th className="text-right px-4 py-2">Rate</th><th className="text-right px-4 py-2">Total Qty</th><th className="text-right px-4 py-2">Total Amount</th><th className="text-right px-4 py-2">Bills</th></tr></thead>
              <tbody>
                {(data as any[])?.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-6" style={{ color: 'var(--theme-text-secondary)' }}>No data</td></tr>
                ) : (data as any[])?.map((r: any) => (
                  <tr key={r.book_code} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                    <td className="px-4 py-2 font-semibold">{r.book_code}</td>
                    <td className="px-4 py-2">{r.title_name}</td>
                    <td className="px-4 py-2 text-center">{r.standard}</td>
                    <td className="px-4 py-2 text-right">₹{(+r.rate).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold">{r.total_qty}</td>
                    <td className="px-4 py-2 text-right font-bold text-primary-500">₹{(+r.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">{r.bill_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* District Comparison */}
          {tab === 'districtComparison' && (
            <div className="grid sm:grid-cols-2 gap-4 p-4">
              {(data as any[])?.length === 0 ? (
                <p className="col-span-2 text-center text-xs py-6" style={{ color: 'var(--theme-text-secondary)' }}>No data for this period</p>
              ) : (data as any[])?.map((d: any) => (
                <div key={d.district_code} className="p-4 rounded-2xl border" style={{ borderColor: 'var(--theme-border)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-lg bg-primary-500 text-white text-xs font-bold">{d.district_code}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{d.district_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p style={{ color: 'var(--theme-text-secondary)' }}>Total Bills</p><p className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{d.bill_count}</p></div>
                    <div><p style={{ color: 'var(--theme-text-secondary)' }}>Total Amount</p><p className="text-lg font-bold text-primary-500">₹{(+d.total_amount).toLocaleString()}</p></div>
                    <div><p style={{ color: 'var(--theme-text-secondary)' }}>Total Qty</p><p className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{d.total_qty}</p></div>
                    <div><p style={{ color: 'var(--theme-text-secondary)' }}>Unique Customers</p><p className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>{d.unique_customers}</p></div>
                    <div className="col-span-2"><p style={{ color: 'var(--theme-text-secondary)' }}>Total Discount</p><p className="text-lg font-bold text-red-500">₹{(+d.total_discount).toLocaleString()}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
