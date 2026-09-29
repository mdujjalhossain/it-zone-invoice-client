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
  // 1. Dynamic Shops State (Initially Empty or fetched from API)
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
  const [shopForm, setShopForm] = useState({ name: '', owner: '', phone: '', initialBalance: 0 });
  const [paymentForm, setPaymentForm] = useState({ amount: '', type: 'PAYMENT', note: '' });

  // Handle Create New Shop
  const handleAddShop = (e) => {
    e.preventDefault();
    if (!shopForm.name || !shopForm.phone) return;

    const newShop = {
      id: Date.now().toString(),
      name: shopForm.name,
      owner: shopForm.owner || 'N/A',
      phone: shopForm.phone,
      balance: parseFloat(shopForm.initialBalance) || 0
    };

    setShops(prev => [...prev, newShop]);
    setSelectedShopId(newShop.id); // Auto-select newly created shop
    setShopForm({ name: '', owner: '', phone: '', initialBalance: 0 });
    setIsShopModalOpen(false);
  };

  // Handle Add Transaction for Selected Shop
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!paymentForm.amount || !selectedShop) return;

    const amountNum = parseFloat(paymentForm.amount);
    const isPayment = paymentForm.type === 'PAYMENT';
    
    // Update Shop Balance
    const balanceChange = isPayment ? -amountNum : amountNum;
    setShops(prevShops => prevShops.map(s => {
      if (s.id === selectedShop.id) {
        return { ...s, balance: s.balance + balanceChange };
      }
      return s;
    }));

    // Record Transaction
    const newTx = {
      id: `TX-${Date.now()}`,
      shopId: selectedShop.id,
      date: new Date().toISOString().split('T')[0],
      type: paymentForm.type,
      ref: isPayment ? `PAY-${Math.floor(100 + Math.random() * 900)}` : `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      debit: isPayment ? 0 : amountNum,
      credit: isPayment ? amountNum : 0,
      balance: selectedShop.balance + balanceChange,
      note: paymentForm.note || (isPayment ? 'Payment Received' : 'New Invoice Generated')
    };

    setTransactions(prev => [...prev, newTx]);
    setPaymentForm({ amount: '', type: 'PAYMENT', note: '' });
    setIsTxModalOpen(false);
  };

  // Filtered transactions for selected shop
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
          <p className="text-sm text-slate-500">Manage shops, customer balance ledgers, and transaction histories.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsShopModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add New Shop
          </button>
          {selectedShop && (
            <button 
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Shops / Clients</label>
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
                      shop.balance > 0 ? 'bg-amber-100 text-amber-800' : shop.balance < 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      ৳{Math.abs(shop.balance)}
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
              <span className="text-sm font-medium text-slate-500">Net Due (Pabo)</span>
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
              <span className="text-sm font-medium text-slate-500">Advance/Payable</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                ৳{selectedShop && selectedShop.balance < 0 ? Math.abs(selectedShop.balance) : 0}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Client deposit or advance</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Active Shop Info</span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 truncate mt-1">
                {selectedShop ? selectedShop.name : 'Select a Shop'}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedShop ? `${selectedShop.owner} • ${selectedShop.phone}` : 'No shop currently selected'}
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
                <th className="px-5 py-3 text-right text-rose-600">Debit (+Pabo)</th>
                <th className="px-5 py-3 text-right text-emerald-600">Credit (-Peyechi)</th>
                <th className="px-5 py-3 text-right">Balance</th>
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
                activeShopTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-2 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {tx.date}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{tx.ref}</td>
                    <td className="px-5 py-3.5 text-slate-500">{tx.note}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-rose-600 whitespace-nowrap">
                      {tx.debit > 0 ? `+৳${tx.debit}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-emerald-600 whitespace-nowrap">
                      {tx.credit > 0 ? `-৳${tx.credit}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                      ৳{tx.balance}
                    </td>
                  </tr>
                ))
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
              <UserPlus className="w-5 h-5 text-indigo-600" /> Add New Shop / Client
            </h3>
            <form onSubmit={handleAddShop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Shop Name *</label>
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
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Owner Name</label>
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Opening Dues/Balance (TK)</label>
                <input 
                  type="number"
                  placeholder="0 (Optional starting balance)"
                  value={shopForm.initialBalance}
                  onChange={(e) => setShopForm({...shopForm, initialBalance: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  Create Shop
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PAYMENT">Payment Received (Credit - Balance Kombe)</option>
                  <option value="INVOICE">New Bill/Invoice (Debit - Balance Barbe)</option>
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
                  placeholder="e.g. Bkash TrxID / Cash payment"
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