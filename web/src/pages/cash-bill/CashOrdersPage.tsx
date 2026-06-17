import { useState, useEffect, useRef, useMemo } from 'react';
import { FileText, Printer, Check, Clock, Search, Eye, Pencil, Plus, Trash2, AlertCircle, X, Save } from 'lucide-react';
import { orderApi, billApi, rateMasterApi } from '../../services/cashBillApi';
import ConfirmDialog from '../../components/cash-bill/ConfirmDialog';

interface Order { id: number; order_no: string; order_date: string; customer_name: string; customer_code: string; total_qty: number; subtotal: number; discount_percent: number; discount_amount: number; net_amount: number; district_code: string; status: string; item_count: number; contact_person: string; }
interface Book { id: number; book_code: string; standard: string; title_name: string; short_title: string; rate: number; }
interface EditItem { book: Book; qty: number; discount_percent: number; amount: number; }

export default function CashOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [msg, setMsg] = useState('');
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [generating, setGenerating] = useState(false);
  const [successDialog, setSuccessDialog] = useState<null | { title: string; message: string }>(null);

  // Edit (modify proforma) state
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [entryError, setEntryError] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  const matchedBook = useMemo(() => {
    if (!codeInput.trim()) return null;
    const q = codeInput.trim().toUpperCase();
    return allBooks.find(b => b.book_code.toUpperCase() === q) || null;
  }, [codeInput, allBooks]);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      if (search) params.search = search;
      const data = await orderApi.list(params);
      setOrders(data);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter, search]);

  const confirmGenerateBill = async () => {
    if (!confirmOrder) return;
    setGenerating(true);
    try {
      const bill = await orderApi.generateBill(confirmOrder.id);
      setConfirmOrder(null);
      setSuccessDialog({
        title: 'Cash Bill Generated',
        message: `Bill ${bill.bill_no} has been created successfully from proforma ${confirmOrder.order_no}. The bill is now final and can be printed.`,
      });
      load();
    } catch (err: any) {
      setMsg(err.message);
      setConfirmOrder(null);
    } finally {
      setGenerating(false);
    }
  };

  const viewDetail = async (id: number) => {
    const data = await orderApi.get(id);
    setDetail(data);
  };

  const openEdit = async (order: Order) => {
    setEditLoading(true);
    setEditOrder(order);
    try {
      // Load full order details + all books
      const [detail, books] = await Promise.all([
        orderApi.get(order.id),
        rateMasterApi.list({ active: 'true' }),
      ]);
      setAllBooks(books);
      setEditDiscount(+detail.discount_percent || 0);
      const items: EditItem[] = (detail.items || []).map((it: any) => ({
        book: { id: it.book_id, book_code: it.book_code, standard: it.standard, title_name: it.title_name, short_title: it.short_title, rate: Number(it.rate) },
        qty: Number(it.qty),
        discount_percent: Number(it.discount_percent || 0),
        amount: Number(it.amount),
      }));
      setEditItems(items);
      setCodeInput('');
      setQtyInput('');
      setEntryError('');
    } catch (err: any) {
      setMsg(err.message);
      setEditOrder(null);
    } finally {
      setEditLoading(false);
    }
  };

  const editAddItem = () => {
    setEntryError('');
    const qtyNum = parseInt(qtyInput, 10);
    if (!matchedBook) {
      setEntryError('Book code not found');
      codeRef.current?.focus();
      return;
    }
    if (!qtyNum || qtyNum < 1) {
      setEntryError('Enter a valid quantity');
      qtyRef.current?.focus();
      return;
    }
    const calcAmt = (rate: number, q: number, p: number) => {
      const g = rate * q; return Math.round((g - g * p / 100) * 100) / 100;
    };
    const existing = editItems.find(i => i.book.id === matchedBook.id);
    if (existing) {
      setEditItems(editItems.map(it => it.book.id === matchedBook.id
        ? { ...it, qty: it.qty + qtyNum, amount: calcAmt(it.book.rate, it.qty + qtyNum, it.discount_percent) }
        : it));
    } else {
      setEditItems([...editItems, { book: matchedBook, qty: qtyNum, discount_percent: 0, amount: calcAmt(matchedBook.rate, qtyNum, 0) }]);
    }
    setCodeInput('');
    setQtyInput('');
    setTimeout(() => codeRef.current?.focus(), 0);
  };

  const calcEditAmt = (rate: number, qty: number, pct: number) => {
    const g = rate * qty; return Math.round((g - g * pct / 100) * 100) / 100;
  };

  const editUpdateQty = (idx: number, qty: number) => {
    if (qty < 1) return;
    setEditItems(editItems.map((it, i) => i === idx ? { ...it, qty, amount: calcEditAmt(it.book.rate, qty, it.discount_percent) } : it));
  };

  const editUpdateDiscount = (idx: number, pct: number) => {
    if (pct < 0 || pct > 100) return;
    setEditItems(editItems.map((it, i) => i === idx ? { ...it, discount_percent: pct, amount: calcEditAmt(it.book.rate, it.qty, pct) } : it));
  };

  const editRemoveItem = (idx: number) => setEditItems(editItems.filter((_, i) => i !== idx));

  const saveEdit = async () => {
    if (!editOrder || editItems.length === 0) return;
    setEditSaving(true);
    try {
      await orderApi.updateItems(editOrder.id, {
        items: editItems.map(i => ({ book_id: i.book.id, qty: i.qty, discount_percent: i.discount_percent })),
        discount_percent: editDiscount,
      });
      setEditOrder(null);
      setSuccessDialog({
        title: 'Proforma Updated',
        message: `Proforma ${editOrder.order_no} has been updated successfully.`,
      });
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const editSubtotal = editItems.reduce((s, i) => s + i.amount, 0);
  const editDiscAmt = Math.round(editSubtotal * editDiscount / 100 * 100) / 100;
  const editNet = editSubtotal - editDiscAmt;
  const editTotalQty = editItems.reduce((s, i) => s + i.qty, 0);

  const printBill = async (billId: number) => {
    const blob = await billApi.pdf(billId);
    const url = URL.createObjectURL(blob as Blob);
    window.open(url, '_blank');
  };

  const printProforma = async (orderId: number) => {
    const blob = await orderApi.pdf(orderId);
    const url = URL.createObjectURL(blob as Blob);
    window.open(url, '_blank');
  };

  const statusBadge = (s: string) => {
    const cls = s === 'billed' ? 'bg-accent-100 text-accent-700' : 'bg-secondary-100 text-secondary-700';
    const icon = s === 'billed' ? <Check size={10} /> : <Clock size={10} />;
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${cls}`}>{icon}{label}</span>;
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Orders</h1>

      {msg && <div className="p-3 mb-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-600">{msg}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 max-w-sm" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}>
          <Search size={14} style={{ color: 'var(--theme-text-secondary)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
            className="flex-1 text-sm bg-transparent outline-none" style={{ color: 'var(--theme-text)' }} />
        </div>
        {[
          { value: '', label: 'All' },
          { value: 'proforma', label: 'Proforma' },
          { value: 'billed', label: 'Billed' },
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filter === value ? 'bg-primary-500 text-white' : 'border'}`}
            style={filter !== value ? { borderColor: 'var(--theme-border)', color: 'var(--theme-text)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text-secondary)' }}>
              <th className="text-left px-4 py-3 font-medium">Order No</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-center px-4 py-3 font-medium">District</th>
              <th className="text-right px-4 py-3 font-medium">Items</th>
              <th className="text-right px-4 py-3 font-medium">Qty</th>
              <th className="text-right px-4 py-3 font-medium">Amount</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>No orders found</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50/50" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                <td className="px-4 py-3 font-semibold text-primary-500">{o.order_no}</td>
                <td className="px-4 py-3">{new Date(o.order_date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">{o.customer_name || o.contact_person || 'Walk-in'}</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] font-bold">{o.district_code}</span></td>
                <td className="px-4 py-3 text-right">{o.item_count}</td>
                <td className="px-4 py-3 text-right">{o.total_qty}</td>
                <td className="px-4 py-3 text-right font-bold">₹{(+o.net_amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">{statusBadge(o.status)}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => viewDetail(o.id)} className="p-1.5 rounded-lg text-info-500 hover:bg-info-50" title="View"><Eye size={13} /></button>
                    {o.status === 'proforma' && (
                      <>
                        <button onClick={() => openEdit(o)} className="p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-50" title="Modify Proforma"><Pencil size={13} /></button>
                        <button onClick={() => printProforma(o.id)} className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50" title="Print Proforma"><Printer size={13} /></button>
                        <button onClick={() => setConfirmOrder(o)} className="p-1.5 rounded-lg text-accent-500 hover:bg-accent-50" title="Generate Bill"><FileText size={13} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{detail.order_no}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg">x</button>
            </div>
            <div className="text-xs space-y-1 mb-4 text-gray-600">
              <p><strong>Customer:</strong> {detail.customer_name || 'Walk-in'} ({detail.customer_code || '-'})</p>
              <p><strong>Date:</strong> {new Date(detail.order_date).toLocaleDateString('en-IN')}</p>
              <p><strong>Contact:</strong> {detail.contact_person} / {detail.contact_mobile}</p>
              <p><strong>Status:</strong> {detail.status?.charAt(0).toUpperCase() + detail.status?.slice(1)}</p>
            </div>
            <table className="w-full text-xs mb-4">
              <thead><tr className="border-b"><th className="text-left py-1">SL</th><th className="text-left">Book</th><th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {detail.items?.map((it: any, i: number) => (
                  <tr key={i} className="border-b"><td className="py-1">{it.sl_no}</td><td>{it.short_title}</td><td className="text-right">{it.qty}</td><td className="text-right">₹{(+it.rate).toFixed(2)}</td><td className="text-right font-bold">₹{(+it.amount).toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="text-sm space-y-1 p-3 rounded-xl bg-gray-50">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{(+detail.subtotal).toFixed(2)}</span></div>
              {+detail.discount_amount > 0 && <div className="flex justify-between text-red-500"><span>Discount ({detail.discount_percent}%)</span><span>-₹{(+detail.discount_amount).toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold border-t pt-1"><span>Net Amount</span><span className="text-primary-500">₹{(+detail.net_amount).toFixed(2)}</span></div>
            </div>

            {detail.bills?.length > 0 && (
              <div className="mt-4 flex gap-2">
                {detail.bills.map((b: any) => (
                  <button key={b.id} onClick={() => printBill(b.id)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600">
                    <Printer size={12} /> Print {b.bill_no}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modify Proforma Modal */}
      {editOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !editSaving && setEditOrder(null)}>
          <div className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>Modify Proforma</h2>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                  {editOrder.order_no} · {editOrder.customer_name || editOrder.contact_person || 'Walk-in'}
                </p>
              </div>
              <button onClick={() => setEditOrder(null)} disabled={editSaving} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" style={{ color: 'var(--theme-text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            {editLoading ? (
              <div className="p-12 text-center text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Loading proforma...</div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Entry row */}
                <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--theme-surface-alt)', borderColor: 'var(--theme-border)' }}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div style={{ minWidth: '200px' }}>
                      <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>Book Code</label>
                      <input
                        ref={codeRef}
                        autoFocus
                        value={codeInput}
                        onChange={e => setCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            if (matchedBook) { e.preventDefault(); qtyRef.current?.focus(); }
                          } else if (e.key === 'Escape') { setCodeInput(''); }
                        }}
                        placeholder="e.g. LABC"
                        spellCheck={false}
                        className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                        style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', borderColor: matchedBook ? '#10b981' : codeInput && !matchedBook ? '#ef4444' : 'var(--theme-border)' }}
                      />
                    </div>
                    <div style={{ minWidth: '100px' }}>
                      <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>Qty</label>
                      <input
                        ref={qtyRef}
                        type="number"
                        value={qtyInput}
                        onChange={e => setQtyInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); editAddItem(); } else if (e.key === 'Escape') { setCodeInput(''); setQtyInput(''); codeRef.current?.focus(); } }}
                        placeholder="1"
                        min={1}
                        className="w-full px-3 py-2 rounded-xl border text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                        style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'transparent' }}>Add</label>
                      <button onClick={editAddItem} disabled={!matchedBook || !qtyInput}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40">
                        <Plus size={14} /> Add
                      </button>
                    </div>
                    <div className="flex-1 flex items-end" style={{ minHeight: '58px' }}>
                      <div className="flex items-center gap-3 text-[10px] flex-wrap" style={{ color: 'var(--theme-text-secondary)' }}>
                        <span><kbd className="px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 font-mono text-[9px]">Tab</kbd> Code → Qty</span>
                        <span><kbd className="px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 font-mono text-[9px]">Enter</kbd> Add</span>
                      </div>
                    </div>
                  </div>
                  {matchedBook ? (
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-lg text-xs" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                      <Check size={12} className="flex-shrink-0" />
                      <span className="font-bold">{matchedBook.title_name}</span> — <span className="font-bold">₹{Number(matchedBook.rate).toFixed(2)}</span>
                      <span className="px-1.5 py-0.5 rounded bg-accent-100 text-[10px] font-bold">{matchedBook.standard}</span>
                      {editItems.find(i => i.book.id === matchedBook.id) && (
                        <span className="ml-auto text-[10px] font-semibold">(already added — will increment)</span>
                      )}
                    </div>
                  ) : codeInput ? (
                    <div className="mt-2 flex items-center gap-2 p-2 rounded-lg text-xs bg-red-50 text-red-600">
                      <AlertCircle size={12} /><span>Book code not found.</span>
                    </div>
                  ) : null}
                  {entryError && <div className="mt-1 text-xs text-red-600">{entryError}</div>}
                </div>

                {/* Items table */}
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
                  {editItems.length === 0 ? (
                    <div className="p-6 text-center text-xs" style={{ color: 'var(--theme-text-secondary)' }}>No items. Add at least one book.</div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text-secondary)' }}>
                          <th className="text-left px-3 py-2 font-medium w-10">SL</th>
                          <th className="text-left px-2 py-2 font-medium">Code</th>
                          <th className="text-left px-2 py-2 font-medium">Book</th>
                          <th className="text-center px-2 py-2 font-medium w-32">Qty</th>
                          <th className="text-right px-2 py-2 font-medium w-20">Rate</th>
                          <th className="text-center px-2 py-2 font-medium w-20">Disc %</th>
                          <th className="text-right px-2 py-2 font-medium w-24">Amount</th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editItems.map((it, idx) => (
                          <tr key={it.book.id} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                            <td className="px-3 py-2 font-semibold">{idx + 1}</td>
                            <td className="px-2 py-2 font-mono font-bold text-primary-500">{it.book.book_code}</td>
                            <td className="px-2 py-2 truncate">{it.book.title_name}</td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-1 justify-center">
                                <button onClick={() => editUpdateQty(idx, it.qty - 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">-</button>
                                <input value={it.qty} onChange={e => editUpdateQty(idx, +e.target.value || 1)} className="w-12 text-center rounded border text-xs py-1" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                                <button onClick={() => editUpdateQty(idx, it.qty + 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">+</button>
                              </div>
                            </td>
                            <td className="px-2 py-2 text-right">₹{it.book.rate.toFixed(2)}</td>
                            <td className="px-2 py-2 text-center">
                              <input type="number" value={it.discount_percent} onChange={e => editUpdateDiscount(idx, +e.target.value || 0)}
                                min={0} max={100} step={0.5}
                                className="w-16 text-center rounded border text-xs py-1" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                            </td>
                            <td className="px-2 py-2 text-right font-bold">₹{it.amount.toFixed(2)}</td>
                            <td className="px-2 py-2">
                              <button onClick={() => editRemoveItem(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Totals + discount */}
                <div className="grid sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Discount %</label>
                    <input type="number" value={editDiscount} onChange={e => setEditDiscount(+e.target.value)} min={0} max={50} step={0.5}
                      className="w-32 px-3 py-2 rounded-xl border text-sm" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)', backgroundColor: 'var(--theme-surface)' }} />
                  </div>
                  <div className="text-xs space-y-1 p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text)' }}>
                    <div className="flex justify-between"><span>Subtotal ({editTotalQty} copies)</span><strong>₹{editSubtotal.toFixed(2)}</strong></div>
                    {editDiscount > 0 && <div className="flex justify-between text-red-500"><span>Discount ({editDiscount}%)</span><strong>-₹{editDiscAmt.toFixed(2)}</strong></div>}
                    <div className="flex justify-between pt-1 border-t font-bold text-sm" style={{ borderColor: 'var(--theme-border)' }}>
                      <span>Net Amount</span><span className="text-primary-500">₹{editNet.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-end gap-2 px-6 py-3 border-t" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <button onClick={() => setEditOrder(null)} disabled={editSaving} className="px-4 py-2 rounded-xl border text-xs font-semibold" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>Cancel</button>
              <button onClick={saveEdit} disabled={editSaving || editItems.length === 0} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold disabled:opacity-50">
                <Save size={14} /> {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: Convert Proforma → Cash Bill */}
      <ConfirmDialog
        open={!!confirmOrder}
        variant="warning"
        title="Generate Final Cash Bill?"
        message={
          confirmOrder ? (
            <div className="space-y-2">
              <p>This will convert the proforma into a <strong>final cash bill</strong>. Once generated, the bill cannot be edited or deleted.</p>
              <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
                <div className="flex justify-between"><span>Proforma No</span><strong>{confirmOrder.order_no}</strong></div>
                <div className="flex justify-between"><span>Customer</span><strong>{confirmOrder.customer_name || confirmOrder.contact_person || 'Walk-in'}</strong></div>
                <div className="flex justify-between"><span>District</span><strong>{confirmOrder.district_code}</strong></div>
                <div className="flex justify-between"><span>Items</span><strong>{confirmOrder.item_count} ({confirmOrder.total_qty} copies)</strong></div>
                <div className="flex justify-between"><span>Net Amount</span><strong className="text-primary-500">₹{(+confirmOrder.net_amount).toFixed(2)}</strong></div>
              </div>
            </div>
          ) : ''
        }
        confirmLabel="Yes, Generate Bill"
        cancelLabel="Cancel"
        loading={generating}
        onConfirm={confirmGenerateBill}
        onCancel={() => setConfirmOrder(null)}
      />

      {/* Success dialog */}
      <ConfirmDialog
        open={!!successDialog}
        variant="success"
        title={successDialog?.title || ''}
        message={successDialog?.message || ''}
        confirmLabel="OK"
        cancelLabel="Close"
        onConfirm={() => setSuccessDialog(null)}
        onCancel={() => setSuccessDialog(null)}
      />
    </div>
  );
}
