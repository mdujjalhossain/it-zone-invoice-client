import { useEffect, useState } from 'react';
import { Search, Printer, Calendar, ShieldCheck, FileText, X, Trash2, Loader2, AlertCircle, DollarSign, BarChart3, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import useApi from '../Components/useApi';
import Swal from 'sweetalert2';

export default function InvoiceHistory() {

  useEffect(() => {
    document.title = "IT Zone-Inventory | Invoice-History";
  }, []);

  const { data: rawData, setData: setInvoices, loading, error: apiError } = useApi('https://it-zone-invoice-server.vercel.app/invoices');
  
  // Safely extract the array whether the API returns a direct array or a wrapped object { data: [...] }
  const invoicesList = Array.isArray(rawData) 
    ? rawData 
    : (rawData?.data && Array.isArray(rawData.data) ? rawData.data : []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'today', 'monthly', 'yearly'

  // --- Deleted Invoices States ---
  const [deletedInvoices, setDeletedInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('it_zone_deleted_invoices');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  // Save deleted items to localStorage to persist across refreshes if needed, or sync with backend collection
  useEffect(() => {
    try {
      localStorage.setItem('it_zone_deleted_invoices', JSON.stringify(deletedInvoices));
    } catch (e) {
      console.error('Failed to save deleted invoices', e);
    }
  }, [deletedInvoices]);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // item shows limit in each page

  const formattedInvoices = invoicesList.map(inv => ({
    id: inv.invoiceNo || inv._id,
    mongoId: inv._id,
    date: inv.currentDate || 'N/A', // Expecting YYYY-MM-DD or standard date format
    customerName: inv.customer?.name || 'Unknown',
    phone: inv.customer?.phone || '',
    address: inv.customer?.address || 'N/A',
    items: inv.items || [],
    discount: inv.discountVal || 0,
    totalPayable: inv.totalPayable || 0,
    warranty: '14 Days Replacement & 3 Years Service Warranty'
  }));

  // Date constants for filtering and calculations
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  // Calculations for Today's, Monthly, and Yearly Earnings from Invoices
  const todaysTotalEarn = formattedInvoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (Number(inv.totalPayable) || 0), 0);

  const monthlyTotalEarn = formattedInvoices
    .filter(inv => inv.date && inv.date.startsWith(currentMonthStr))
    .reduce((sum, inv) => sum + (Number(inv.totalPayable) || 0), 0);

  const yearlyTotalEarn = formattedInvoices
    .filter(inv => inv.date && inv.date.startsWith(currentYearStr))
    .reduce((sum, inv) => sum + (Number(inv.totalPayable) || 0), 0);

  // Filter invoices based on search term and view mode
  const filteredInvoices = formattedInvoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.phone.includes(searchTerm) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    if (viewMode === 'today') {
      return matchesSearch && inv.date === todayStr;
    } else if (viewMode === 'monthly') {
      return matchesSearch && inv.date && inv.date.startsWith(currentMonthStr);
    } else if (viewMode === 'yearly') {
      return matchesSearch && inv.date && inv.date.startsWith(currentYearStr);
    }
    return matchesSearch;
  });

  // --- Pagination Boundary Calculations ---
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;

  // Handle boundary condition: if current page exceeds total pages after filtering/deletion, reset it safely
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [filteredInvoices.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1); // Reset to page 1 on view change
  };

  const handleDeleteInvoice = async (invoiceId) => {
    const swalResult = await Swal.fire({
      title: 'Are you sure?',
      text: "You are going to delete this invoice! Total sales amount will be updated.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#111827',
      color: '#f3f4f6'
    });

    if (!swalResult.isConfirmed) {
      return;
    }

    try {
      const invoiceToDelete = formattedInvoices.find(inv => inv.mongoId === invoiceId || inv.id === invoiceId);

      const response = await fetch(`https://it-zone-invoice-server.vercel.app/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete invoice');
      }

      // Add to local deleted archive state for tracking
      if (invoiceToDelete) {
        setDeletedInvoices(prev => [...prev, { ...invoiceToDelete, deletedAt: new Date().toLocaleString() }]);
      }

      // Remove from active state list immediately so sales totals and UI update
      setInvoices(prev => {
        const list = Array.isArray(prev) ? prev : (prev?.data || []);
        return list.filter(inv => inv._id !== invoiceId && inv.invoiceNo !== invoiceId);
      });
      
      if (selectedInvoice && (selectedInvoice.id === invoiceId || selectedInvoice.mongoId === invoiceId)) {
        setSelectedInvoice(null);
      }

      Swal.fire({
        title: 'Deleted!',
        text: 'Invoice successfully deleted and archived.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#111827',
        color: '#f3f4f6'
      });
    } catch (err) {
      console.error('Error deleting invoice:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete invoice.',
        icon: 'error',
        background: '#111827',
        color: '#f3f4f6'
      });
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Hidden Print Section */}
      {selectedInvoice && (
        <div className="hidden print:flex flex-col justify-between bg-white text-black p-14 w-[210mm] h-[270mm] mx-auto font-sans box-border relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start border-b-2 border-gray-800 pt-10 pb-3 mb-3">
              <div>
                <h1 className="text-2xl font-black tracking-wider text-blue-600">IT ZONE</h1>
                <p className="text-[14px] text-gray-600 font-semibold mt-0.5">Shop No. E-174, Sena Complex, Nabinagar, Savar, Dhaka</p>
                <p className="text-[14px] text-gray-600">Phone: +880 1624-687651</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800">INVOICE</h2>
                <p className="text-[14px] text-gray-600 mt-0.5"><span className="font-semibold">Invoice No:</span> {selectedInvoice.id}</p>
                <p className="text-[14px] text-gray-600"><span className="font-semibold">Date:</span> {selectedInvoice.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3 bg-gray-50 p-2.5 rounded border border-gray-200">
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Seller</h3>
                <p className="font-bold text-gray-900">IT ZONE</p>
                <p className="text-[14px] text-gray-600">Savar Sena Complex</p>
                <p className="text-[14px] text-gray-600">Phone: +8801624687651</p>
              </div>
              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Bill To</h3>
                <p className="font-bold text-gray-900">{selectedInvoice.customerName}</p>
                <p className="text-[14px] text-gray-600">Address: {selectedInvoice.address}</p>
                <p className="text-[14px] text-gray-600">Phone: +88{selectedInvoice.phone}</p>
              </div>
            </div>

            <table className="w-full mb-3 border-collapse">
              <thead>
                <tr className="bg-black text-white text-[10px] uppercase">
                  <th className="py-1.5 px-2 text-left">Description / Product</th>
                  <th className="py-1.5 px-2 text-center w-16">Qty</th>
                  <th className="py-1.5 px-2 text-right w-24">Unit Price</th>
                  <th className="py-1.5 px-2 text-right w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 text-gray-800 font-medium">{item.productName}</td>
                    <td className="py-1.5 px-2 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-1.5 px-2 text-right text-gray-600">৳ {item.price}</td>
                    <td className="py-1.5 px-2 text-right font-semibold text-gray-900">৳ {item.quantity * item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-4">
              <div className="w-56 space-y-1 text-xs border-t border-gray-300 pt-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">৳ {selectedInvoice.totalPayable + selectedInvoice.discount}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span className="font-semibold text-red-600">-৳ {selectedInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-gray-800 pt-1 text-black">
                  <span>Total Payable:</span>
                  <span>৳ {selectedInvoice.totalPayable}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded p-2.5 bg-gray-50/50 text-[12px] space-y-1 text-gray-700 mb-4 mt-10">
              <p className="font-bold text-black uppercase tracking-wide border-b border-gray-200 pb-1 mb-1">Warranty & Replacement Terms:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><span className="font-semibold">14 Days Replacement Guarantee</span> for manufacturing defects.</li>
                <li><span className="font-semibold">3 Years Service Warranty</span> available (Parts excluded).</li>
                <li><span className="font-semibold text-red-600">No Warranty & Guarantee</span> applicable for Display or Screen.</li>
              </ul>
            </div>
          </div>

          <div className="text-center border-t border-gray-300 pt-2 mt-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest bg-black text-white py-1">Thank you for your business with IT ZONE!</p>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <div className="print:hidden space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
              Records & Verification
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Invoice History & Tracking</h1>
          </div>
        </div>

        {/* API Error Box */}
        {apiError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>Failed to load invoices: {apiError}</span>
          </div>
        )}

        {/* Dynamic Summary Cards (Today, Monthly, Yearly) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Today's Total Sales</p>
              <h3 className="text-2xl font-extrabold text-green-400 mt-1">৳ {todaysTotalEarn.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Month's Total Sales</p>
              <h3 className="text-2xl font-extrabold text-blue-400 mt-1">৳ {monthlyTotalEarn.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Calendar size={24} />
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Year's Total Sales</p>
              <h3 className="text-2xl font-extrabold text-purple-400 mt-1">৳ {yearlyTotalEarn.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <BarChart3 size={24} />
            </div>
          </div>
        </div>

        {/* Filter Buttons & Deleted Invoices Button Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 bg-[#111827] border border-gray-800 p-2 rounded-2xl shadow-md">
            <button
              onClick={() => handleViewModeChange('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => handleViewModeChange('today')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'today' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Today's History
            </button>
            <button
              onClick={() => handleViewModeChange('monthly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Monthly History
            </button>
            <button
              onClick={() => handleViewModeChange('yearly')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                viewMode === 'yearly' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Yearly History
            </button>
          </div>

          <button
            onClick={() => setShowDeletedModal(true)}
            className="px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Trash2 size={16} />
            Deleted Invoices ({deletedInvoices.length})
          </button>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
          <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <FileText size={16} className="text-blue-400" /> 
              {viewMode === 'today' ? "Today's Invoices" : viewMode === 'monthly' ? "Monthly Invoices" : viewMode === 'yearly' ? "Yearly Invoices" : "All Invoices"} ({filteredInvoices.length})
            </h3>

            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search by ID or Phone or Name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900/80 text-gray-400 text-xs uppercase border-b border-gray-800">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer Info</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4 text-right">Total Payable</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                        <span>Loading invoices from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentInvoices.length > 0 ? (
                  currentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-900/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-blue-400">{inv.id}</td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs flex items-center gap-1.5 mt-1">
                        <Calendar size={14} /> {inv.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{inv.customerName}</p>
                        <p className="text-xs text-gray-400">{inv.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium">
                          {inv.items.length} Item(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-green-400">৳ {inv.totalPayable}</td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={14} /> View
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv.mongoId)}
                          className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                      No matching invoices found!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- Pagination Footer Controls --- */}
          {!loading && filteredInvoices.length > 0 && (
            <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div>
                Showing <span className="text-white font-semibold">{startIndex + 1}</span> to <span className="text-white font-semibold">{Math.min(startIndex + itemsPerPage, filteredInvoices.length)}</span> of <span className="text-white font-semibold">{filteredInvoices.length}</span> invoices
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-gray-300"
                >
                  Previous
                </button>

                <div className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 font-semibold">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Invoice Detail & Verification Modal */}
      {selectedInvoice && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-400" size={20} />
                <h2 className="text-lg font-bold text-white">Invoice & Warranty Verification</h2>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-gray-300">
              <div className="flex justify-between border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white tracking-wider">IT ZONE</h3>
                  <p className="text-xs text-gray-400">Computer, Laptop, CC Camera Sale & Service Center</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-400">{selectedInvoice.id}</p>
                  <p className="text-xs text-gray-400">{selectedInvoice.date}</p>
                </div>
              </div>

              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-gray-500 uppercase block">Customer Name</span>
                  <span className="font-semibold text-white">{selectedInvoice.customerName}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block">Contact Number</span>
                  <span className="font-semibold text-white">{selectedInvoice.phone}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-gray-500 uppercase block">Address</span>
                  <span className="font-semibold text-white">{selectedInvoice.address}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Purchased Products</h4>
                <div className="border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-900 text-gray-400 text-xs border-b border-gray-800">
                        <th className="py-2.5 px-4">Item Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {selectedInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 font-medium text-white">{it.productName}</td>
                          <td className="py-3 px-4 text-center">{it.quantity}</td>
                          <td className="py-3 px-4 text-right font-semibold">৳ {it.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-center gap-3">
                <ShieldCheck className="text-green-400 shrink-0" size={24} />
                <div>
                  <p className="text-xs text-green-400 font-bold uppercase">Warranty Policy Verified</p>
                  <p className="text-sm text-gray-200 font-medium">{selectedInvoice.warranty}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice.mongoId)}
                className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={16} /> Delete Invoice
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={16} /> Print Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Deleted Invoices Serialized Modal --- */}
      {showDeletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <div className="flex items-center gap-2">
                <Trash2 className="text-red-400" size={20} />
                <h2 className="text-lg font-bold text-white">Deleted Invoices History ({deletedInvoices.length})</h2>
              </div>
              <button 
                onClick={() => setShowDeletedModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {deletedInvoices.length > 0 ? (
                <div className="border border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead>
                      <tr className="bg-gray-900 text-gray-400 text-xs uppercase border-b border-gray-800">
                        <th className="py-3 px-4"># Sl</th>
                        <th className="py-3 px-4">Invoice ID</th>
                        <th className="py-3 px-4">Customer Info</th>
                        <th className="py-3 px-4">Deleted At</th>
                        <th className="py-3 px-4 text-right">Total Payable</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {deletedInvoices.map((item, index) => (
                        <tr key={item.mongoId || index} className="hover:bg-gray-900/40">
                          <td className="py-3.5 px-4 font-semibold text-gray-400">{index + 1}</td>
                          <td className="py-3.5 px-4 font-bold text-red-400">{item.id}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">{item.customerName}</p>
                            <p className="text-xs text-gray-400">{item.phone}</p>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-400">{item.deletedAt}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-green-400">৳ {item.totalPayable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No deleted invoices found in the archive!
                </div>
              )}
            </div>

              {/* clear the deleted archive */}
            {/* <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-between items-center">
              {deletedInvoices.length > 0 && (
                <button
                  onClick={() => {
                    setDeletedInvoices([]);
                    localStorage.removeItem('it_zone_deleted_invoices');
                  }}
                  className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Archive
                </button>
              )}
              <button
                onClick={() => setShowDeletedModal(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-all cursor-pointer ml-auto"
              >
                Close
              </button>
            </div> */}

          </div>
        </div>
      )}

    </div>
  );
}