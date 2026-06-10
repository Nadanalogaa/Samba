import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, ArrowLeft, Check, AlertCircle, ShoppingCart, FileText } from 'lucide-react';
import { rateMasterApi, customerApi, orderApi } from '../../services/cashBillApi';
import ConfirmDialog from '../../components/cash-bill/ConfirmDialog';

interface Book { id: number; book_code: string; standard: string; title_name: string; short_title: string; rate: number; }
interface Customer { id: number; customer_code: string; customer_name: string; customer_type: string; discount_percent: number; district_code: string; contact_person: string; phone: string; }
interface LineItem { book: Book; qty: number; amount: number; }

export default function NewOrderPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('cash-bill-user') || '{}');
  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState(user.districts?.[0] || 'CHE');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [walkInAddr1, setWalkInAddr1] = useState('');
  const [walkInAddr2, setWalkInAddr2] = useState('');
  const [walkInPin, setWalkInPin] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [codeInput, setCodeInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [entryError, setEntryError] = useState('');
  const codeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState<null | 'proforma' | 'bill'>(null);
  const [successDialog, setSuccessDialog] = useState<null | { title: string; message: string }>(null);

  useEffect(() => {
    customerApi.list({ district }).then(setCustomers).catch(() => {});
    rateMasterApi.list({ active: 'true' }).then(setBooks).catch(() => {});
  }, [district]);

  useEffect(() => {
    if (selectedCustomer) {
      setDiscountPercent(+selectedCustomer.discount_percent || 0);
      setContactPerson(selectedCustomer.contact_person || '');
      setContactMobile(selectedCustomer.phone || '');
    }
  }, [selectedCustomer]);

  // Live book lookup for entered code (prefix match, case-insensitive)
  const matchedBook = useMemo(() => {
    if (!codeInput.trim()) return null;
    const q = codeInput.trim().toUpperCase();
    return books.find(b => b.book_code.toUpperCase() === q) || null;
  }, [codeInput, books]);

  // Show suggestions (prefix match) when user is typing but hasn't hit exact match
  useEffect(() => {
    if (!codeInput.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = codeInput.trim().toUpperCase();
    const matches = books
      .filter(b => b.book_code.toUpperCase().startsWith(q))
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setHighlightIdx(0);
  }, [codeInput, books]);

  const addLineItem = (book: Book, qty: number) => {
    const rate = Number(book.rate);
    const existing = items.find(i => i.book.id === book.id);
    if (existing) {
      setItems(items.map(it => it.book.id === book.id ? { ...it, qty: it.qty + qty, amount: Number(it.book.rate) * (it.qty + qty) } : it));
    } else {
      setItems([...items, { book: { ...book, rate }, qty, amount: rate * qty }]);
    }
  };

  const handleAddEntry = () => {
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
    addLineItem(matchedBook, qtyNum);
    // Reset for next entry
    setCodeInput('');
    setQtyInput('');
    setShowSuggestions(false);
    setTimeout(() => codeRef.current?.focus(), 0);
  };

  const handleCodeKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setHighlightIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      // If a suggestion is visible, pick it
      if (showSuggestions && suggestions[highlightIdx]) {
        e.preventDefault();
        setCodeInput(suggestions[highlightIdx].book_code);
        setShowSuggestions(false);
        setTimeout(() => qtyRef.current?.focus(), 0);
      } else if (matchedBook && e.key === 'Enter') {
        e.preventDefault();
        qtyRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleQtyKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEntry();
    } else if (e.key === 'Escape') {
      setCodeInput('');
      setQtyInput('');
      codeRef.current?.focus();
    }
  };

  const updateQty = (idx: number, qty: number) => {
    if (qty < 1) return;
    setItems(items.map((it, i) => i === idx ? { ...it, qty, amount: Number(it.book.rate) * qty } : it));
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + Number(i.amount), 0);
  const discountAmount = Math.round(subtotal * Number(discountPercent) / 100 * 100) / 100;
  const netAmount = subtotal - discountAmount;
  const totalQty = items.reduce((s, i) => s + Number(i.qty), 0);

  const handleSubmit = async (generateBill: boolean) => {
    setLoading(true);
    setError('');
    try {
      const order = await orderApi.create({
        customer_id: selectedCustomer?.id || null,
        contact_person: contactPerson,
        contact_mobile: contactMobile,
        walk_in_name: selectedCustomer ? '' : walkInName,
        walk_in_address1: selectedCustomer ? '' : walkInAddr1,
        walk_in_address2: selectedCustomer ? '' : walkInAddr2,
        walk_in_pin: selectedCustomer ? '' : walkInPin,
        discount_percent: discountPercent,
        district_code: district,
        items: items.map(i => ({ book_id: i.book.id, qty: i.qty })),
      });

      setConfirmAction(null);
      if (generateBill) {
        const bill = await orderApi.generateBill(order.id);
        setSuccessDialog({
          title: 'Cash Bill Generated',
          message: `Bill ${bill.bill_no} has been generated successfully. This bill is now final and cannot be edited.`,
        });
      } else {
        setSuccessDialog({
          title: 'Proforma Saved',
          message: `Proforma ${order.order_no} has been saved. You can review and convert it to a cash bill from the Orders page.`,
        });
      }
    } catch (err: any) {
      setError(err.message);
      setConfirmAction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Proforma Entry / Cash Bill</h1>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-6">
        {['Customer', 'Add Books', 'Review'].map((s, i) => (
          <div key={s} className={`flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all ${step === i + 1 ? 'bg-primary-500 text-white' : step > i + 1 ? 'bg-accent-100 text-accent-700' : 'border text-gray-400'}`}
            style={step <= i ? { borderColor: 'var(--theme-border)' } : {}}>
            {s}
          </div>
        ))}
      </div>

      {error && <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Step 1: Customer */}
      {step === 1 && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
            {user.districts?.length > 1 ? 'Select District & Customer' : 'Select Customer'}
          </h2>

          <div className={`grid ${user.districts?.length > 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'} gap-4 mb-4`}>
            {user.districts?.length > 1 && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>District *</label>
                <select value={district} onChange={e => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                  {user.districts?.map((d: string) => <option key={d} value={d}>{d === 'CHE' ? 'Chennai (CHE)' : 'Coimbatore (CBE)'}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Customer</label>
              <select value={selectedCustomer?.id || ''} onChange={e => {
                const c = customers.find(c => c.id === +e.target.value);
                setSelectedCustomer(c || null);
              }}
                className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                <option value="">-- Walk-in --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.customer_code} - {c.customer_name} (Type {c.customer_type})</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Contact Person</label>
              <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Name"
                className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Mobile</label>
              <input value={contactMobile} onChange={e => setContactMobile(e.target.value)} placeholder="Phone number"
                className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
            </div>
          </div>

          {/* Walk-in address (only shown when no customer is selected) */}
          {!selectedCustomer && (
            <div className="mt-4 p-4 rounded-xl border border-dashed" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-alt)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>
                Walk-in Customer Address <span className="font-normal" style={{ color: 'var(--theme-text-secondary)' }}>(optional — stored for this bill)</span>
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Customer Name</label>
                  <input value={walkInName} onChange={e => setWalkInName(e.target.value)} placeholder="Walk-in name"
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Pin Code</label>
                  <input value={walkInPin} onChange={e => setWalkInPin(e.target.value)} placeholder="600001"
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Address Line 1</label>
                  <input value={walkInAddr1} onChange={e => setWalkInAddr1(e.target.value)} placeholder="Street, Area"
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text)' }}>Address Line 2</label>
                  <input value={walkInAddr2} onChange={e => setWalkInAddr2(e.target.value)} placeholder="City, State"
                    className="w-full px-3 py-2 rounded-xl border text-sm" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-all">
              Next: Add Books <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Add Books — keyboard-driven entry (code → Tab → qty → Enter) */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Entry row */}
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-start gap-3 flex-wrap">
              {/* Book Code */}
              <div className="relative" style={{ minWidth: '200px' }}>
                <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>Book Code</label>
                <input
                  ref={codeRef}
                  autoFocus
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={handleCodeKey}
                  onFocus={() => codeInput && setShowSuggestions(suggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. LABC"
                  spellCheck={false}
                  className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', borderColor: matchedBook ? '#10b981' : codeInput && !matchedBook ? '#ef4444' : 'var(--theme-border)' }}
                />
                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && !matchedBook && (
                  <div className="absolute left-0 right-0 mt-1 rounded-xl border shadow-lg z-20 overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                    {suggestions.map((b, i) => (
                      <div key={b.id}
                        onMouseDown={() => { setCodeInput(b.book_code); setShowSuggestions(false); setTimeout(() => qtyRef.current?.focus(), 0); }}
                        className="px-3 py-2 text-xs cursor-pointer"
                        style={{ backgroundColor: i === highlightIdx ? 'var(--theme-surface-alt)' : 'var(--theme-surface)', color: 'var(--theme-text)' }}>
                        <span className="font-mono font-bold text-primary-500">{b.book_code}</span>
                        <span className="mx-2" style={{ color: 'var(--theme-text-secondary)' }}>|</span>
                        <span>{b.title_name}</span>
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] font-bold">{b.standard}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div style={{ minWidth: '100px' }}>
                <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>Quantity</label>
                <input
                  ref={qtyRef}
                  type="number"
                  value={qtyInput}
                  onChange={e => setQtyInput(e.target.value)}
                  onKeyDown={handleQtyKey}
                  placeholder="1"
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{ backgroundColor: 'var(--theme-surface)', color: 'var(--theme-text)', borderColor: 'var(--theme-border)' }}
                />
              </div>

              {/* Add button */}
              <div>
                <label className="block text-[10px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'transparent' }}>Add</label>
                <button onClick={handleAddEntry} disabled={!matchedBook || !qtyInput}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40">
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Keyboard hints — single line */}
              <div className="flex-1 flex items-end" style={{ minHeight: '58px' }}>
                <div className="flex items-center gap-3 text-[10px] flex-wrap" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span><kbd className="px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 font-mono text-[9px]">Tab</kbd> Code → Qty</span>
                  <span><kbd className="px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 font-mono text-[9px]">Enter</kbd> Add & continue</span>
                  <span><kbd className="px-1.5 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 font-mono text-[9px]">Esc</kbd> Clear</span>
                </div>
              </div>
            </div>

            {/* Book name reference (below code field) */}
            {matchedBook ? (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg text-xs" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                <Check size={14} className="flex-shrink-0" />
                <span className="font-bold">{matchedBook.title_name}</span>
                <span>—</span>
                <span className="font-bold">₹{Number(matchedBook.rate).toFixed(2)}</span>
                <span className="px-1.5 py-0.5 rounded bg-accent-100 text-[10px] font-bold">{matchedBook.standard}</span>
                {items.find(i => i.book.id === matchedBook.id) && (
                  <span className="ml-auto text-[10px] font-semibold">(already added — will be updated)</span>
                )}
              </div>
            ) : codeInput && !showSuggestions ? (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg text-xs bg-red-50 text-red-600">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>Book code not found. Check the code and try again.</span>
              </div>
            ) : null}

            {entryError && (
              <div className="mt-2 text-xs text-red-600">{entryError}</div>
            )}
          </div>

          {/* Items table */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-alt)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--theme-text)' }}>Order Items ({items.length})</h3>
              {items.length > 0 && (
                <div className="text-xs font-semibold" style={{ color: 'var(--theme-text)' }}>
                  {totalQty} copies · <span className="text-primary-500">₹{subtotal.toFixed(2)}</span>
                </div>
              )}
            </div>
            {items.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>
                Start by entering a book code above. e.g. LABC → Tab → 10 → Enter
              </p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ color: 'var(--theme-text-secondary)' }}>
                    <th className="text-left px-4 py-2 font-medium w-10">SL</th>
                    <th className="text-left px-2 py-2 font-medium">Code</th>
                    <th className="text-left px-2 py-2 font-medium">Book Name</th>
                    <th className="text-center px-2 py-2 font-medium w-16">Std</th>
                    <th className="text-center px-2 py-2 font-medium w-32">Qty</th>
                    <th className="text-right px-2 py-2 font-medium w-20">Rate</th>
                    <th className="text-right px-2 py-2 font-medium w-24">Amount</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.book.id} className="border-t" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                      <td className="px-4 py-2 font-semibold">{idx + 1}</td>
                      <td className="px-2 py-2 font-mono font-bold text-primary-500">{item.book.book_code}</td>
                      <td className="px-2 py-2 truncate">{item.book.title_name}</td>
                      <td className="px-2 py-2 text-center">
                        <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-600 text-[10px] font-bold">{item.book.standard}</span>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1 justify-center">
                          <button onClick={() => updateQty(idx, item.qty - 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">-</button>
                          <input value={item.qty} onChange={e => updateQty(idx, +e.target.value || 1)}
                            className="w-12 text-center rounded border text-xs py-1" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
                          <button onClick={() => updateQty(idx, item.qty + 1)} className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200">+</button>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">₹{Number(item.book.rate).toFixed(2)}</td>
                      <td className="px-2 py-2 text-right font-bold">₹{Number(item.amount).toFixed(2)}</td>
                      <td className="px-2 py-2">
                        <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface-alt)' }}>
                    <td colSpan={4}></td>
                    <td className="px-2 py-2 text-center font-bold" style={{ color: 'var(--theme-text)' }}>{totalQty}</td>
                    <td></td>
                    <td className="px-2 py-2 text-right font-bold text-primary-500">₹{subtotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div className="flex justify-between gap-2">
            <button onClick={() => setStep(1)} className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border hover:bg-gray-50" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
              <ArrowLeft size={12} /> Back
            </button>
            <button onClick={() => setStep(3)} disabled={items.length === 0}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40">
              Review <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Order Review</h2>

          <div className="grid sm:grid-cols-3 gap-3 mb-4 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            <div><strong style={{ color: 'var(--theme-text)' }}>District:</strong> {district}</div>
            <div><strong style={{ color: 'var(--theme-text)' }}>Customer:</strong> {selectedCustomer ? `${selectedCustomer.customer_code} - ${selectedCustomer.customer_name}` : 'Walk-in'}</div>
            <div><strong style={{ color: 'var(--theme-text)' }}>Contact:</strong> {contactPerson || '-'} / {contactMobile || '-'}</div>
          </div>

          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                <th className="text-left py-2">SL</th><th className="text-left">Book</th><th className="text-left">Standard</th>
                <th className="text-right">Qty</th><th className="text-right">Rate</th><th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={it.book.id} className="border-b" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
                  <td className="py-2">{i + 1}</td><td>{it.book.short_title}</td><td>{it.book.standard}</td>
                  <td className="text-right">{it.qty}</td><td className="text-right">₹{it.book.rate}</td><td className="text-right font-bold">₹{it.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-4 mb-4">
            <label className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>Discount %</label>
            <input type="number" value={discountPercent} onChange={e => setDiscountPercent(+e.target.value)} min={0} max={50} step={0.5}
              className="w-20 px-2 py-1.5 rounded-lg border text-sm text-center" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }} />
          </div>

          <div className="text-sm space-y-1 p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-surface-alt)', color: 'var(--theme-text)' }}>
            <div className="flex justify-between"><span>Subtotal ({totalQty} copies)</span><span>₹{subtotal.toFixed(2)}</span></div>
            {discountPercent > 0 && <div className="flex justify-between text-red-500"><span>Discount ({discountPercent}%)</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-1 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <span>Net Amount</span><span className="text-primary-500">₹{netAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => setStep(2)} className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-semibold border" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}>
              <ArrowLeft size={12} /> Edit Items
            </button>
            <button onClick={() => setConfirmAction('proforma')} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border-2 border-primary-500 text-primary-500 hover:bg-primary-50 disabled:opacity-40">
              <FileText size={14} /> Generate Proforma Bill
            </button>
            <button onClick={() => setConfirmAction('bill')} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-40">
              <ShoppingCart size={14} /> Generate Cash Bill
            </button>
          </div>
        </div>
      )}

      {/* Confirm: Generate Proforma */}
      <ConfirmDialog
        open={confirmAction === 'proforma'}
        variant="info"
        title="Generate Proforma Bill?"
        message={
          <div className="space-y-2">
            <p>A proforma is a draft bill that you can review, edit, or convert to a final cash bill later.</p>
            <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
              <div className="flex justify-between"><span>Items</span><strong>{items.length}</strong></div>
              <div className="flex justify-between"><span>Quantity</span><strong>{totalQty}</strong></div>
              <div className="flex justify-between"><span>Net Amount</span><strong className="text-primary-500">₹{netAmount.toFixed(2)}</strong></div>
            </div>
          </div>
        }
        confirmLabel="Yes, Save Proforma"
        cancelLabel="Not yet"
        loading={loading}
        onConfirm={() => handleSubmit(false)}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Confirm: Generate Cash Bill */}
      <ConfirmDialog
        open={confirmAction === 'bill'}
        variant="warning"
        title="Generate Final Cash Bill?"
        message={
          <div className="space-y-2">
            <p>A cash bill is <strong>final</strong> and cannot be edited once generated. A bill number will be assigned and the transaction recorded.</p>
            <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
              <div className="flex justify-between"><span>Customer</span><strong>{selectedCustomer?.customer_name || walkInName || 'Walk-in'}</strong></div>
              <div className="flex justify-between"><span>Items</span><strong>{items.length}</strong></div>
              <div className="flex justify-between"><span>Quantity</span><strong>{totalQty}</strong></div>
              <div className="flex justify-between"><span>Net Amount</span><strong className="text-primary-500">₹{netAmount.toFixed(2)}</strong></div>
            </div>
          </div>
        }
        confirmLabel="Yes, Generate Bill"
        cancelLabel="Cancel"
        loading={loading}
        onConfirm={() => handleSubmit(true)}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Success dialog (replaces inline label) */}
      <ConfirmDialog
        open={!!successDialog}
        variant="success"
        title={successDialog?.title || ''}
        message={successDialog?.message || ''}
        confirmLabel="Go to Orders"
        cancelLabel="Stay Here"
        onConfirm={() => { setSuccessDialog(null); navigate('/cash-bill/orders'); }}
        onCancel={() => { setSuccessDialog(null); navigate('/cash-bill'); }}
      />
    </div>
  );
}
