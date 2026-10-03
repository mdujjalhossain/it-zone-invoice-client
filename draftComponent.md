import { useEffect, useState } from 'react';
import { Search, Plus, BookOpen, X, Calendar, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import useApi from '../Components/useApi';
import Swal from 'sweetalert2';

export default function Ledger() {
  useEffect(() => {
    document.title = "IT Zone-Inventory | Ledger";
  }, []);

  const { data: rawLedger, setData: setLedger, loading, error: apiError } = useApi('https://it-zone-invoice-server.vercel.app/ledger');
  
  const ledgerList = Array.isArray(rawLedger) 
    ? rawLedger 
    : (rawLedger?.data && Array.isArray(rawLedger.data) ? rawLedger.data : []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'today', 'monthly', 'yearly'
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    type: 'Income',
    amount: '',
    category: '',
    note: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.slice(0, 7);
  const currentYearStr = todayStr.slice(0, 4);

  const todaysTotal = ledgerList
    .filter(item => item.date === todayStr)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const monthlyTotal = ledgerList
    .filter(item => item.date && item.date.startsWith(currentMonthStr))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const yearlyTotal = ledgerList
    .filter(item => item.date && item.date.startsWith(currentYearStr))
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const filteredEntries = ledgerList.filter(item => {
    const entryId = item.id || item._id || '';
    const title = item.title || '';
    const category = item.category || '';

    const matchesSearch = 
      entryId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase());

    if (viewMode === 'today') {
      return matchesSearch && item.date === todayStr;
    } else if (viewMode === 'monthly') {
      return matchesSearch && item.date && item.date.startsWith(currentMonthStr);
    } else if (viewMode === 'yearly') {
      return matchesSearch && item.date && item.date.startsWith(currentYearStr);
    }
    return matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.title || !newEntry.amount || !newEntry.category) {
      setErrorMsg('Please enter all the information!');
      return;
    }

    const entryItem = {
      id: `ITZ-LED-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      title: newEntry.title,
      type: newEntry.type,
      amount: Number(newEntry.amount) || 0,
      category: newEntry.category,
      note: newEntry.note
    };

    try {
      const res = await fetch('https://it-zone-invoice-server.vercel.app/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryItem)
      });
      const data = await res.json();

      if (data.success) {
        setLedger(prev => {
          const list = Array.isArray(prev) ? prev : (prev?.data || []);
          return [data.data, ...list];
        });
        setIsModalOpen(false);
        setNewEntry({
          title: '',
          type: 'Income',
          amount: '',
          category: '',
          note: ''
        });
        setErrorMsg('');
        Swal.fire({
          title: 'Success!',
          text: 'Ledger entry created successfully.',
          icon: 'success',
          background: '#111827',
          color: '#fff',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        setErrorMsg(data.error || 'Failed to create entry');
      }
    } catch (err) {
      console.error('Error posting ledger:', err);
      setErrorMsg('Network error occurred');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
            Finance & Accounts
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Ledger Management</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> New Ledger Entry
        </button>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Today's Total Amount</p>
            <h3 className="text-2xl font-extrabold text-green-400 mt-1">৳ {todaysTotal.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Month's Total Amount</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">৳ {monthlyTotal.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Year's Total Amount</p>
            <h3 className="text-2xl font-extrabold text-purple-400 mt-1">৳ {yearlyTotal.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 bg-[#111827] border border-gray-800 p-2 rounded-2xl w-fit shadow-md">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            viewMode === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          All Entries
        </button>
        <button
          onClick={() => setViewMode('today')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            viewMode === 'today' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Today's History
        </button>
        <button
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Monthly History
        </button>
        <button
          onClick={() => setViewMode('yearly')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            viewMode === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Yearly History
        </button>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-400" /> 
            {viewMode === 'today' ? "Today's Ledger Queue" : viewMode === 'monthly' ? "Monthly Ledger History" : viewMode === 'yearly' ? "Yearly Ledger History" : "Active Ledger Queue"} ({filteredEntries.length})
          </h3>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Quick search by ID, title, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className="py-3 px-5">Entry ID / Date</th>
                <th className="py-3 px-5">Title & Category</th>
                <th className="py-3 px-5">Type</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-400 font-medium">Loading ledger entries...</p>
                    </div>
                  </td>
                </tr>
              ) : currentEntries.length > 0 ? (
                currentEntries.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-gray-900/40 transition-all">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-blue-400 block">{item.id}</span>
                      <span className="text-xs text-gray-500">{item.date}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.type === 'Income' 
                          ? 'bg-green-500/15 text-green-400 border-green-500/20' 
                          : 'bg-red-500/15 text-red-400 border-red-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-white">
                      ৳ {item.amount}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-400 truncate max-w-xs">
                      {item.note || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                    No matching ledger entries found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && filteredEntries.length > 0 && (
          <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div>
              Showing <span className="text-white font-semibold">{startIndex + 1}</span> to <span className="text-white font-semibold">{Math.min(startIndex + itemsPerPage, filteredEntries.length)}</span> of <span className="text-white font-semibold">{filteredEntries.length}</span> entries
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              
              <span className="text-gray-300 font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add New Ledger Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-blue-400" /> Create New Ledger Entry
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Title / Description 
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office Rent / Sales Revenue"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Type 
                    <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Amount (৳) 
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Category 
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Utilities, Sales, Salary"
                  value={newEntry.category}
                  onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Note (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Additional details..."
                  value={newEntry.note}
                  onChange={(e) => setNewEntry({...newEntry, note: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Create Entry
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}