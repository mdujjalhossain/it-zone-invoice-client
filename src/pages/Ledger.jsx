import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building2, 
  DollarSign, 
  Calendar,
  FileText
} from 'lucide-react';

const Ledger = () => {
  // Dummy Shops Data
  const [shops] = useState([
    { id: '1', name: 'Al-Madina Enterprise', owner: 'Rahim Uddin', phone: '01711000000', balance: 15400 },
    { id: '2', name: 'Bismillah Traders', owner: 'Kabir Hossain', phone: '01811000000', balance: -2500 },
    { id: '3', name: 'Tech World IT', owner: 'Tanvir Ahmed', phone: '01911000000', balance: 8200 },
  ]);

  const [selectedShopId, setSelectedShopId] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected Shop Details
  const selectedShop = shops.find(s => s.id === selectedShopId) || shops[0];

  // Dummy Ledger Transactions
  const [transactions, setTransactions] = useState([
    { id: 'T001', date: '2026-09-25', type: 'INVOICE', ref: 'INV-1021', debit: 20000, credit: 0, balance: 20000, note: 'Product Purchase' },
    { id: 'T002', date: '2026-09-27', type: 'PAYMENT', ref: 'PAY-501', debit: 0, credit: 10000, balance: 10000, note: 'Bkash Payment Received' },
    { id: 'T003', date: '2026-09-29', type: 'INVOICE', ref: 'INV-1055', debit: 5400, credit: 0, balance: 15400, note: 'RAM & SSD Purchase' },
  ]);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    type: 'PAYMENT',
    note: ''
  });

  // Handle Add Transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) return;

    const amountNum = parseFloat(paymentForm.amount);
    const isPayment = paymentForm.type === 'PAYMENT';
    
    const lastBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;
    const newBalance = isPayment ? lastBalance - amountNum : lastBalance + amountNum;

    const newTx = {
      id: `T00${transactions.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      type: paymentForm.type,
      ref: isPayment ? `PAY-${Math.floor(100 + Math.random() * 900)}` : `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      debit: isPayment ? 0 : amountNum,
      credit: isPayment ? amountNum : 0,
      balance: newBalance,
      note: paymentForm.note || (isPayment ? 'Cash/Online Received' : 'New Goods Invoiced')
    };

    setTransactions(prev => [...prev, newTx]);
    setPaymentForm({ amount: '', type: 'PAYMENT', note: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Shop Ledger & Khatian
          </h1>
          <p className="text-sm text-slate-500">Track all accounts, customer balances, and transaction histories.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all">
            <Download className="w-4 h-4" /> Export Statement
          </button>
        </div>
      </div>

      {/* Top Filter Bar & Shop Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Shop / Client</label>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search shop..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {shops
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    shop.balance > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    ৳{Math.abs(shop.balance)}
                  </span>
                </button>
              ))}
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
                ৳{selectedShop.balance > 0 ? selectedShop.balance : 0}
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
                ৳{selectedShop.balance < 0 ? Math.abs(selectedShop.balance) : 0}
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
              <h3 className="text-lg font-bold text-slate-800 truncate mt-1">{selectedShop.name}</h3>
              <p className="text-xs text-slate-500">{selectedShop.owner} • {selectedShop.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Transaction Log for {selectedShop.name}
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            {transactions.length} Entries
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
              {transactions.map((tx) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
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
                  onClick={() => setIsModalOpen(false)}
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