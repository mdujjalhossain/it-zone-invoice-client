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
  Pencil,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import useApi from '../Components/useApi';
import Swal from 'sweetalert2';

const API = 'https://it-zone-invoice-server.vercel.app';

// Shared style tokens (same look as ServiceTracking)
const ui = {
  card: 'bg-[#111827] border border-gray-800 rounded-2xl shadow-xl',
  input:
    'w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all',
  label: 'block text-xs font-semibold text-gray-400 mb-1',
  eyebrow:
    'text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold',
  btnPrimary:
    'px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed',
  btnSuccess:
    'px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 cursor-pointer',
  btnSecondary:
    'px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2',
  th: 'py-3 px-5'
};

// Defined outside the Ledger component so it isn't re-created on every render
const ModalError = ({ message }) =>
  message ? (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
      {message}
    </div>
  ) : null;

const emptyShopForm = { name: '', owner: '', phone: '', initialBalance: '', balanceType: 'RECEIVABLE' };
const emptyPaymentForm = { amount: '', type: 'PAYMENT_IN', note: '' };

const Ledger = () => {
  useEffect(() => {
    document.title = 'IT Zone-Inventory | Ledger';
  }, []);

  // 1. Shops (GET /ledger/shops)
  const {
    data: rawShops,
    setData: setShops,
    loading: shopsLoading,
    error: apiError
  } = useApi(`${API}/ledger/shops`);

  // Safely extract the array whether the API returns a direct array or { data: [...] }
  const shops = Array.isArray(rawShops)
    ? rawShops
    : rawShops?.data && Array.isArray(rawShops.data)
    ? rawShops.data
    : [];

  const updateShops = (fn) =>
    setShops(prev => {
      const list = Array.isArray(prev) ? prev : prev?.data || [];
      return fn(list);
    });

  const [selectedShopId, setSelectedShopId] = useState(null);
  const selectedShop = shops.find(s => s._id === selectedShopId);

  // 2. Transactions of the selected shop (GET /ledger/transactions?shopId=...)
  // The fetched list is stored together with the shopId it belongs to, so "loading", the list and
  // the error can all be derived while rendering (no setState calls in the effect body).
  const [txState, setTxState] = useState({ shopId: null, list: [], error: '' });
  const isTxCurrent = txState.shopId === selectedShopId;
  const transactions = isTxCurrent ? txState.list : [];
  const txError = isTxCurrent ? txState.error : '';
  const txLoading = Boolean(selectedShopId) && !isTxCurrent;

  useEffect(() => {
    if (!selectedShopId) return;

    let cancelled = false;

    fetch(`${API}/ledger/transactions?shopId=${selectedShopId}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setTxState({
          shopId: selectedShopId,
          list: data.success ? data.data : [],
          error: data.success ? '' : data.error || 'Failed to load transactions'
        });
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        if (!cancelled) setTxState({ shopId: selectedShopId, list: [], error: 'Network error occurred' });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedShopId]);

  // 3. Search & modal states
  const [searchQuery, setSearchQuery] = useState('');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState(null); // null = create mode
  const [shopForm, setShopForm] = useState(emptyShopForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openCreateShop = () => {
    setEditingShopId(null);
    setShopForm(emptyShopForm);
    setErrorMsg('');
    setIsShopModalOpen(true);
  };

  const openEditShop = () => {
    if (!selectedShop) return;
    setEditingShopId(selectedShop._id);
    setShopForm({
      ...emptyShopForm,
      name: selectedShop.name,
      owner: selectedShop.owner === 'N/A' ? '' : selectedShop.owner,
      phone: selectedShop.phone
    });
    setErrorMsg('');
    setIsShopModalOpen(true);
  };

  const openTxModal = () => {
    setPaymentForm(emptyPaymentForm);
    setErrorMsg('');
    setIsTxModalOpen(true);
  };

  const showSuccess = (text) =>
    Swal.fire({
      title: 'Success!',
      text,
      icon: 'success',
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#2563eb',
      timer: 1500,
      showConfirmButton: false
    });

  // Create (POST) or edit (PATCH) a shop
  const handleSaveShop = async (e) => {
    e.preventDefault();
    if (!shopForm.name || !shopForm.phone) {
      setErrorMsg('Shop name and phone number are required!');
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = Boolean(editingShopId);
      const res = await fetch(
        isEdit ? `${API}/ledger/shops/${editingShopId}` : `${API}/ledger/shops`,
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isEdit
              ? { name: shopForm.name, owner: shopForm.owner, phone: shopForm.phone }
              : shopForm
          )
        }
      );
      const data = await res.json();

      if (data.success) {
        if (isEdit) {
          updateShops(list => list.map(s => (s._id === editingShopId ? { ...s, ...data.data } : s)));
        } else {
          updateShops(list => [data.data, ...list]);
          setSelectedShopId(data.data._id);
        }
        setIsShopModalOpen(false);
        setShopForm(emptyShopForm);
        setEditingShopId(null);
        setErrorMsg('');
        showSuccess(isEdit ? 'Shop updated successfully.' : 'Shop created successfully.');
      } else {
        setErrorMsg(data.error || 'Failed to save shop');
      }
    } catch (err) {
      console.error('Error saving shop:', err);
      setErrorMsg('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete the shop being edited (DELETE) - also removes its transactions on the server
  const handleDeleteShop = async () => {
    if (!editingShopId) return;

    const shopName = shops.find(s => s._id === editingShopId)?.name || 'this shop';
    const confirmation = await Swal.fire({
      title: 'Delete this shop?',
      text: `"${shopName}" and all of its transactions will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#fff',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#374151'
    });
    if (!confirmation.isConfirmed) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/ledger/shops/${editingShopId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        updateShops(list => list.filter(s => s._id !== editingShopId));
        if (selectedShopId === editingShopId) setSelectedShopId(null);
        setIsShopModalOpen(false);
        setEditingShopId(null);
        setShopForm(emptyShopForm);
        setErrorMsg('');
        showSuccess('Shop deleted successfully.');
      } else {
        setErrorMsg(data.error || 'Failed to delete shop');
      }
    } catch (err) {
      console.error('Error deleting shop:', err);
      setErrorMsg('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Add transaction (POST) - server updates the balance and returns both records
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!selectedShop) return;

    const amountNum = parseFloat(paymentForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg('Please enter an amount greater than 0!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/ledger/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopId: selectedShop._id,
          type: paymentForm.type,
          amount: amountNum,
          note: paymentForm.note
        })
      });
      const data = await res.json();

      if (data.success) {
        const { transaction, shop } = data.data;
        updateShops(list => list.map(s => (s._id === shop._id ? shop : s)));
        setTxState(prev =>
          prev.shopId === shop._id ? { ...prev, list: [...prev.list, transaction] } : prev
        );
        setIsTxModalOpen(false);
        setPaymentForm(emptyPaymentForm);
        setErrorMsg('');
        showSuccess('Transaction saved successfully.');
      } else {
        setErrorMsg(data.error || 'Failed to save transaction');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      setErrorMsg('Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredShops = shops.filter(
    s =>
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery)
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
    <div className="space-y-6 max-w-7xl mx-auto mt-10 pb-12">

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
          <button onClick={openCreateShop} className={ui.btnPrimary}>
            <UserPlus size={18} /> Add New Shop/Vendor
          </button>
          {selectedShop && (
            <>
              <button onClick={openEditShop} className={ui.btnSecondary}>
                <Pencil size={16} /> Edit Shop
              </button>
              <button onClick={openTxModal} className={ui.btnSuccess}>
                <Plus size={18} /> Add Transaction
              </button>
            </>
          )}
        </div>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

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
            {shopsLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8">
                <Loader2 size={24} className="text-blue-500 animate-spin" />
                <p className="text-xs text-gray-400 font-medium">Loading shops...</p>
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">
                No shops added yet.<br />Click "Add New Shop/Vendor" to start.
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs">No matching shops found!</div>
            ) : (
              filteredShops.map(shop => (
                <button
                  key={shop._id}
                  onClick={() => setSelectedShopId(shop._id)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 text-sm cursor-pointer border ${
                    selectedShopId === shop._id
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
                      ? `+৳${shop.balance.toLocaleString()} (পাবো)`
                      : shop.balance < 0
                      ? `-৳${Math.abs(shop.balance).toLocaleString()} (দেবো)`
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
            {transactions.length} Entries
          </span>
        </div>

        {txError && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {txError}
          </div>
        )}

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
              {txLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-400 font-medium">Loading transactions...</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    {selectedShop
                      ? 'No transactions logged for this shop.'
                      : 'Please select or add a shop to view transactions.'}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDebitGreen = tx.type === 'PAYMENT_OUT'; // Paid supplier, payable reduced
                  const isCreditRed = tx.type === 'INVOICE_IN'; // Bought on credit, payable increased
                  const badge = typeBadge(tx.type);

                  return (
                    <tr key={tx._id} className="hover:bg-gray-900/40 transition-all">
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
                        {tx.debit > 0 ? `৳${tx.debit.toLocaleString()}` : '-'}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${
                          isCreditRed ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {tx.credit > 0 ? `৳${tx.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-white whitespace-nowrap">
                        {tx.balance > 0 ? (
                          <span className="text-yellow-400">+৳{tx.balance.toLocaleString()} (পাবো)</span>
                        ) : tx.balance < 0 ? (
                          <span className="text-red-400">-৳{Math.abs(tx.balance).toLocaleString()} (দেবো)</span>
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

      {/* Modal 1: Add / Edit Shop */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400" />
                {editingShopId ? 'Edit Shop / Vendor' : 'Add New Shop / Vendor'}
              </h3>
              <button
                type="button"
                onClick={() => setIsShopModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShop} className="p-6 space-y-4">
              <ModalError message={errorMsg} />

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

              {/* Opening balance can only be set when creating; after that it changes through transactions */}
              {!editingShopId && (
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
              )}

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-gray-800">
                {editingShopId ? (
                  <button
                    type="button"
                    onClick={handleDeleteShop}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} /> Delete Shop
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsShopModalOpen(false)} className={ui.btnSecondary}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className={ui.btnPrimary}>
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {editingShopId ? 'Save Changes' : 'Create'}
                  </button>
                </div>
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
              <ModalError message={errorMsg} />

              <div>
                <label className={ui.label}>Transaction Type</label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                  className={`${ui.input} cursor-pointer`}
                >
                  <option value="PAYMENT_IN">💵 Received Payment (টাকা আদায় / সাপ্লায়ার দিল)</option>
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
                <button type="submit" disabled={submitting} className={ui.btnPrimary}>
                  {submitting && <Loader2 size={16} className="animate-spin" />}
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