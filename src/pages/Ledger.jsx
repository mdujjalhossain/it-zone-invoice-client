import { useState } from 'react';
import { 
  Search, 
  Plus,
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  DollarSign, 
  Calendar,
  FileText,
  UserPlus
} from 'lucide-react';

const Ledger = () => {
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
      case 'INVOICE_OUT': // Sold Goods on Credit (পাওনা বাড়ল)
        balanceChange = amountNum;
        debit = amountNum;
        break;
      case 'INVOICE_IN': // Bought Goods on Credit / Take from Supplier (দেনা বাড়ল)
        balanceChange = -amountNum;
        credit = amountNum;
        break;
      default:
        break;
    }

    const newBalance = selectedShop.balance + balanceChange;

    // Update Shop Balance
    setShops(prevShops => prevShops.map(s => {
      if (s.id === selectedShop.id) {
        return { ...s, balance: newBalance };
      }
      return s;
    }));

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
      note: paymentForm.note || (
        paymentForm.type === 'PAYMENT_IN' ? 'Payment Received' :
        paymentForm.type === 'PAYMENT_OUT' ? 'Payment Given' :
        paymentForm.type === 'INVOICE_OUT' ? 'Sales Invoice' : 'Purchase Invoice'
      )
    };

    setTransactions(prev => [...prev, newTx]);
    setPaymentForm({ amount: '', type: 'PAYMENT_IN', note: '' });
    setIsTxModalOpen(false);
  };

  const activeShopTransactions = transactions.filter(t => t.shopId === selectedShopId);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Shop Ledger & Khatian
          </h1>
          <p className="text-sm text-slate-500">Manage customer/supplier ledgers and multi-type transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsShopModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" /> Add New Shop/Vendor
          </button>
          {selectedShop && (
            <button 
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Top Filter Bar & Shop Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Shops / Clients / Suppliers</label>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{shops.length} Total</span>
          </div>
          
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by shop or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {shops.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No shops added yet.<br />Click "+ Add New Shop" to start.
              </div>
            ) : (
              shops
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery))
                .map(shop => (
                  <button
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between text-sm ${
                      selectedShopId === shop.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="truncate">{shop.name}</p>
                      <p className="text-xs text-slate-400 font-normal">{shop.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      shop.balance > 0 ? 'bg-amber-100 text-amber-800' : shop.balance < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {shop.balance > 0 ? `+৳${shop.balance} (পাবো)` : shop.balance < 0 ? `-৳${Math.abs(shop.balance)} (দেবো)` : '৳0'}
                    </span>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Selected Shop Summary Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Net Due (পাবো)</span>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ৳{selectedShop && selectedShop.balance > 0 ? selectedShop.balance : 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Outstanding receivable amount</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Net Payable (দেবো)</span>
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ৳{selectedShop && selectedShop.balance < 0 ? Math.abs(selectedShop.balance) : 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Supplier or advance payable amount</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Active Party Info</span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 truncate mt-1">
                {selectedShop ? selectedShop.name : 'Select a Shop'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedShop ? `${selectedShop.owner} • ${selectedShop.phone}` : 'No shop selected'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Transaction Log {selectedShop && `for ${selectedShop.name}`}
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            {activeShopTransactions.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Ref/Invoice</th>
                <th className="px-5 py-3">Note / Particulars</th>
                <th className="px-5 py-3 text-right">Debit (+Paoana / -Dena)</th>
                <th className="px-5 py-3 text-right">Credit (-Paoana / +Dena)</th>
                <th className="px-5 py-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeShopTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-400">
                    {selectedShop ? 'No transactions logged for this shop.' : 'Please select or add a shop to view transactions.'}
                  </td>
                </tr>
              ) : (
                activeShopTransactions.map((tx) => {
                  // Dynamic Color Resolution based on Transaction Nature
                  const isDebitGreen = tx.type === 'PAYMENT_OUT'; // Taka dile dena komlo = Green
                  const isCreditRed = tx.type === 'INVOICE_IN';  // Bakite kinle dena barlo = Red

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-2 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {tx.date}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{tx.ref}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${
                          tx.type === 'INVOICE_IN' ? 'bg-rose-100 text-rose-700' :
                          tx.type === 'PAYMENT_OUT' ? 'bg-emerald-100 text-emerald-700' :
                          tx.type === 'INVOICE_OUT' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {tx.type === 'PAYMENT_IN' ? 'টাকা আদায়' : 
                           tx.type === 'PAYMENT_OUT' ? 'টাকা প্রদান' : 
                           tx.type === 'INVOICE_OUT' ? 'বাকিতে বিক্রি' : 'বাকিতে ক্রয়'}
                        </span>
                        {tx.note}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-semibold whitespace-nowrap ${
                        isDebitGreen ? 'text-emerald-600' : 'text-indigo-600'
                      }`}>
                        {tx.debit > 0 ? `৳${tx.debit}` : '-'}
                      </td>
                      <td className={`px-5 py-3.5 text-right font-semibold whitespace-nowrap ${
                        isCreditRed ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {tx.credit > 0 ? `৳${tx.credit}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {tx.balance > 0 ? (
                          <span className="text-amber-600">+৳{tx.balance} (পাবো)</span>
                        ) : tx.balance < 0 ? (
                          <span className="text-rose-600">-৳{Math.abs(tx.balance)} (দেবো)</span>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" /> Add New Shop / Vendor
            </h3>
            <form onSubmit={handleAddShop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Name / Shop *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Enterprise"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Owner / Contact Person</label>
                <input 
                  type="text"
                  placeholder="e.g. Rahim Uddin"
                  value={shopForm.owner}
                  onChange={(e) => setShopForm({...shopForm, owner: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 01700000000"
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({...shopForm, phone: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Opening Amount (TK)</label>
                  <input 
                    type="number"
                    placeholder="0.00"
                    value={shopForm.initialBalance}
                    onChange={(e) => setShopForm({...shopForm, initialBalance: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Balance Type</label>
                  <select 
                    value={shopForm.balanceType}
                    onChange={(e) => setShopForm({...shopForm, balanceType: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="RECEIVABLE">পাবো (Receivable - Client)</option>
                    <option value="PAYABLE">দেবো (Payable - Supplier)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsShopModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">New Entry for {selectedShop.name}</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Transaction Type</label>
                <select 
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="PAYMENT_IN">💵 Received Payment (টাকা আদায় / কাস্টমার দিল)</option>
                  <option value="PAYMENT_OUT">💸 Paid Money (টাকা প্রদান / সাপ্লায়ারকে দিলাম)</option>
                  <option value="INVOICE_OUT">🧾 Sales Bill / Due (বাকিতে বিক্রি / পাওনা বাড়ল)</option>
                  <option value="INVOICE_IN">📦 Purchase Bill / Credit (বাকিতে ক্রয় / দেনা বাড়ল)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (TK)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="number"
                    required
                    placeholder="0.00"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Note / Reference</label>
                <input 
                  type="text"
                  placeholder="e.g. Bkash / Cash / Invoice #102"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
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