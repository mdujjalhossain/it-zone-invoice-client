import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  UserPlus,
  X
} from 'lucide-react';

// Shared style tokens (same look as ServiceTracking)
const ui = {
  card: 'bg-[#111827] border border-gray-800 rounded-2xl shadow-xl',
  input:
    'w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all',
  label: 'block text-xs font-semibold text-gray-400 mb-1',
  eyebrow:
    'text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold',
  btnPrimary:
    'px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer',
  btnSuccess:
    'px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer',
  btnSecondary:
    'px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer',
  th: 'py-3 px-5'
};

const Ledger = () => {
  useEffect(() => {
    document.title = 'IT Zone-Inventory | Ledger';
  }, []);

  // 1. Dynamic Shops State
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);

  // 2. Search & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // Selected Shop Details
  const selectedShop = shops.find(s => s.id === selectedShopId);

  // 3. Transactions State
  const [transactions, setTransactions] = useState([]);

  // Forms State
  const [shopForm, setShopForm] = useState({
    name: '',
    owner: '',
    phone: '',
    initialBalance: 0,
    balanceType: 'RECEIVABLE'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'PAYMENT_IN',
    note: ''
  });

  // Handle Create New Shop
  const handleAddShop = (e) => {
    e.preventDefault();
    if (!shopForm.name || !shopForm.phone) return;

    const rawAmount = parseFloat(shopForm.initialBalance) || 0;
    const calculatedBalance = shopForm.balanceType === 'RECEIVABLE' ? rawAmount : -rawAmount;

    const newShop = {
      id: Date.now().toString(),
      name: shopForm.name,
      owner: shopForm.owner || 'N/A',
      phone: shopForm.phone,
      balance: calculatedBalance
    };

    setShops(prev => [...prev, newShop]);
    setSelectedShopId(newShop.id);
    setShopForm({ name: '', owner: '', phone: '', initialBalance: 0, balanceType: 'RECEIVABLE' });
    setIsShopModalOpen(false);
  };

  // Handle Add Transaction for Selected Shop
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !selectedShop) return;

    const amountNum = parseFloat(paymentForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    let balanceChange = 0;
    let debit = 0;
    let credit = 0;

    switch (paymentForm.type) {
      case 'PAYMENT_IN': // Got Money from Client (পাওনা কমল)
        balanceChange = -amountNum;
        credit = amountNum;
        break;
      case 'PAYMENT_OUT': // Paid Money to Supplier (দেনা কমল)
        balanceChange = amountNum;
        debit = amountNum;
        break;
      case 'INVOICE_OUT': // Sold Goods on Credit (পাওনা বাড়ল)
        balanceChange = amountNum;
        debit = amountNum;
        break;
      case 'INVOICE_IN': // Bought Goods on Credit / Take from Supplier (দেনা বাড়ল)
        balanceChange = -amountNum;
        credit = amountNum;
        break;
      default:
        break;
    }

    const newBalance = selectedShop.balance + balanceChange;

    // Update Shop Balance
    setShops(prevShops =>
      prevShops.map(s => (s.id === selectedShop.id ? { ...s, balance: newBalance } : s))
    );

    // Record Transaction
    const newTx = {
      id: `TX-${Date.now()}`,
      shopId: selectedShop.id,
      date: new Date().toISOString().split('T')[0],
      type: paymentForm.type,
      ref: paymentForm.type.startsWith('PAYMENT')
        ? `PAY-${Math.floor(100 + Math.random() * 900)}`
        : `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      debit,
      credit,
      balance: newBalance,
      note:
        paymentForm.note ||
        (paymentForm.type === 'PAYMENT_IN'
          ? 'Payment Received'
          : paymentForm.type === 'PAYMENT_OUT'
          ? 'Payment Given'
          : paymentForm.type === 'INVOICE_OUT'
          ? 'Sales Invoice'
          : 'Purchase Invoice')
    };

    setTransactions(prev => [...prev, newTx]);
    setPaymentForm({ amount: '', type: 'PAYMENT_IN', note: '' });
    setIsTxModalOpen(false);
  };

  const activeShopTransactions = transactions.filter(t => t.shopId === selectedShopId);

  const filteredShops = shops.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
  );

  // Transaction type badge styles (dark theme)
  const typeBadge = (type) => {
    switch (type) {
      case 'INVOICE_IN':
        return { cls: 'bg-red-500/15 text-red-400 border-red-500/20', text: 'বাকিতে ক্রয়' };
      case 'PAYMENT_OUT':
        return { cls: 'bg-green-500/15 text-green-400 border-green-500/20', text: 'টাকা প্রদান' };
      case 'INVOICE_OUT':
        return { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', text: 'বাকিতে বিক্রি' };
      default:
        return { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20', text: 'টাকা আদায়' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Top Header Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 ${ui.card}`}>
        <div>
          <span className={ui.eyebrow}>Accounts & Khatian</span>
          <h1 className="text-2xl font-extrabold text-white mt-2 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-400" />
            Shop Ledger & Khatian
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage customer/supplier ledgers and multi-type transactions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setIsShopModalOpen(true)} className={ui.btnPrimary}>
            <UserPlus size={18} /> Add New Shop/Vendor
          </button>
          {selectedShop && (
            <button onClick={() => setIsTxModalOpen(true)} className={ui.btnSuccess}>
              <Plus size={18} /> Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Shop Selector + Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Shop selector */}
        <div className={`lg:col-span-1 p-5 ${ui.card}`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Shops / Clients / Suppliers
            </p>
            <span className="text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {shops.length} Total
            </span>
          </div>

          <div className="relative mb-3">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by shop or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${ui.input} pl-10 pr-4`}
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {shops.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                No shops added yet.<br />Click "Add New Shop/Vendor" to start.
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">No matching shops found!</div>
            ) : (
              filteredShops.map(shop => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 text-sm cursor-pointer border ${
                    selectedShopId === shop.id
                      ? 'bg-blue-600/15 border-blue-500/30 text-blue-400 font-semibold'
                      : 'border-transparent text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate">{shop.name}</p>
                    <p className="text-xs text-gray-500 font-normal">{shop.phone}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg font-bold border whitespace-nowrap ${
                      shop.balance > 0
                        ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                        : shop.balance < 0
                        ? 'bg-red-500/15 text-red-400 border-red-500/20'
                        : 'bg-gray-700 text-gray-300 border-gray-600'
                    }`}
                  >
                    {shop.balance > 0
                      ? `+৳${shop.balance} (পাবো)`
                      : shop.balance < 0
                      ? `-৳${Math.abs(shop.balance)} (দেবো)`
                      : '৳0'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`p-6 flex items-center justify-between ${ui.card}`}>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Net Due (পাবো)</p>
              <h3 className="text-2xl font-extrabold text-yellow-400 mt-1">
                ৳ {selectedShop && selectedShop.balance > 0 ? selectedShop.balance.toLocaleString() : 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Outstanding receivable amount</p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
              <ArrowUpRight size={24} />
            </div>
          </div>

          <div className={`p-6 flex items-center justify-between ${ui.card}`}>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Net Payable (দেবো)</p>
              <h3 className="text-2xl font-extrabold text-red-400 mt-1">
                ৳ {selectedShop && selectedShop.balance < 0 ? Math.abs(selectedShop.balance).toLocaleString() : 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Supplier or advance payable</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <ArrowDownLeft size={24} />
            </div>
          </div>

          <div className={`p-6 flex items-center justify-between gap-3 ${ui.card}`}>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Active Party Info</p>
              <h3 className="text-lg font-extrabold text-blue-400 truncate mt-1">
                {selectedShop ? selectedShop.name : 'Select a Shop'}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-1">
                {selectedShop ? `${selectedShop.owner} • ${selectedShop.phone}` : 'No shop selected'}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Transactions Table */}
      <div className={`${ui.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            Transaction Log {selectedShop && `for ${selectedShop.name}`}
          </h3>
          <span className="text-xs bg-gray-800 text-gray-300 border border-gray-700 px-2.5 py-1 rounded-full font-semibold">
            {activeShopTransactions.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className={ui.th}>Date</th>
                <th className={ui.th}>Ref/Invoice</th>
                <th className={ui.th}>Note / Particulars</th>
                <th className={`${ui.th} text-right`}>Debit (+Paoana / -Dena)</th>
                <th className={`${ui.th} text-right`}>Credit (-Paoana / +Dena)</th>
                <th className={`${ui.th} text-right`}>Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {activeShopTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    {selectedShop
                      ? 'No transactions logged for this shop.'
                      : 'Please select or add a shop to view transactions.'}
                  </td>
                </tr>
              ) : (
                activeShopTransactions.map((tx) => {
                  const isDebitGreen = tx.type === 'PAYMENT_OUT'; // Paid supplier, payable reduced
                  const isCreditRed = tx.type === 'INVOICE_IN'; // Bought on credit, payable increased
                  const badge = typeBadge(tx.type);

                  return (
                    <tr key={tx.id} className="hover:bg-gray-900/40 transition-all">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-gray-400">
                          <Calendar size={14} className="text-blue-400 shrink-0" />
                          {tx.date}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-blue-400 whitespace-nowrap">{tx.ref}</td>
                      <td className="px-5 py-3.5 text-gray-400">
                        <span className={`inline-block px-2.5 py-1 border rounded-lg text-xs font-bold mr-2 ${badge.cls}`}>
                          {badge.text}
                        </span>
                        {tx.note}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${
                          isDebitGreen ? 'text-green-400' : 'text-blue-400'
                        }`}
                      >
                        {tx.debit > 0 ? `৳${tx.debit}` : '-'}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${
                          isCreditRed ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {tx.credit > 0 ? `৳${tx.credit}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-white whitespace-nowrap">
                        {tx.balance > 0 ? (
                          <span className="text-yellow-400">+৳{tx.balance} (পাবো)</span>
                        ) : tx.balance < 0 ? (
                          <span className="text-red-400">-৳{Math.abs(tx.balance)} (দেবো)</span>
                        ) : (
                          '৳0'
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Shop */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400" /> Add New Shop / Vendor
              </h3>
              <button
                type="button"
                onClick={() => setIsShopModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddShop} className="p-6 space-y-4">
              <div>
                <label className={ui.label}>
                  Name / Shop <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Enterprise"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  className={ui.input}
                />
              </div>

              <div>
                <label className={ui.label}>Owner / Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rahim Uddin"
                  value={shopForm.owner}
                  onChange={(e) => setShopForm({ ...shopForm, owner: e.target.value })}
                  className={ui.input}
                />
              </div>

              <div>
                <label className={ui.label}>
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01700000000"
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                  className={ui.input}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={ui.label}>Opening Amount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={shopForm.initialBalance}
                    onChange={(e) => setShopForm({ ...shopForm, initialBalance: e.target.value })}
                    className={ui.input}
                  />
                </div>

                <div>
                  <label className={ui.label}>Balance Type</label>
                  <select
                    value={shopForm.balanceType}
                    onChange={(e) => setShopForm({ ...shopForm, balanceType: e.target.value })}
                    className={`${ui.input} cursor-pointer`}
                  >
                    <option value="RECEIVABLE">পাবো (Receivable - Client)</option>
                    <option value="PAYABLE">দেবো (Payable - Supplier)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setIsShopModalOpen(false)} className={ui.btnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Transaction */}
      {isTxModalOpen && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-blue-400" /> New Entry for {selectedShop.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className={ui.label}>Transaction Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className={`${ui.input} cursor-pointer`}
                >
                  <option value="PAYMENT_IN">💵 Received Payment (টাকা আদায় / কাস্টমার দিল)</option>
                  <option value="PAYMENT_OUT">💸 Paid Money (টাকা প্রদান / সাপ্লায়ারকে দিলাম)</option>
                  <option value="INVOICE_OUT">🧾 Sales Bill / Due (বাকিতে বিক্রি / পাওনা বাড়ল)</option>
                  <option value="INVOICE_IN">📦 Purchase Bill / Credit (বাকিতে ক্রয় / দেনা বাড়ল)</option>
                </select>
              </div>

              <div>
                <label className={ui.label}>
                  Amount (৳) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className={`${ui.input} pl-10 pr-4`}
                  />
                </div>
              </div>

              <div>
                <label className={ui.label}>Note / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Bkash / Cash / Invoice #102"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className={ui.input}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
                <button type="button" onClick={() => setIsTxModalOpen(false)} className={ui.btnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
