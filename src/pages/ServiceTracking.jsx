import { useEffect, useState } from 'react';
import { Search, Plus, Wrench, Laptop, X, Calendar, DollarSign, BarChart3, Loader2 } from 'lucide-react';
import useApi from '../Components/useApi';
import Swal from 'sweetalert2';

export default function ServiceTracking() {
  useEffect(() => {
    document.title = "IT Zone-Inventory | Service-tracking";
  }, []);

  // Destructure the loading state alongside data, setter, and error from the custom useApi hook
  const { data: rawTickets, setData: setTickets, loading, error: apiError } = useApi('https://it-zone-invoice-server.vercel.app/services');
  
  // Safely extract the array whether the API returns a direct array or a wrapped object { data: [...] }
  const ticketsList = Array.isArray(rawTickets) 
    ? rawTickets 
    : (rawTickets?.data && Array.isArray(rawTickets.data) ? rawTickets.data : []);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'today', 'monthly', 'yearly'
  
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    phone: '',
    deviceModel: '',
    issue: '',
    status: 'Received',
    cost: '',
    advance: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Calculations for Today's, Monthly, and Yearly Earnings (Only counting 'Delivered' status)
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentMonthStr = todayStr.slice(0, 7); // YYYY-MM
  const currentYearStr = todayStr.slice(0, 4); // YYYY

  // Today's Total Earn Calculation
  const todaysTotalEarn = ticketsList
    .filter(t => t.date === todayStr && t.status === 'Delivered')
    .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  // Monthly Total Earn Calculation
  const monthlyTotalEarn = ticketsList
    .filter(t => t.date && t.date.startsWith(currentMonthStr) && t.status === 'Delivered')
    .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  // Yearly Total Earn Calculation
  const yearlyTotalEarn = ticketsList
    .filter(t => t.date && t.date.startsWith(currentYearStr) && t.status === 'Delivered')
    .reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  // Filtered tickets based on search and view mode
  const filteredTickets = ticketsList.filter(t => {
    const ticketId = t.id || t._id || '';
    const customerName = t.customerName || '';
    const phone = t.phone || '';
    const deviceModel = t.deviceModel || '';

    const matchesSearch = 
      ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      deviceModel.toLowerCase().includes(searchTerm.toLowerCase());

    if (viewMode === 'today') {
      return matchesSearch && t.date === todayStr;
    } else if (viewMode === 'monthly') {
      return matchesSearch && t.date && t.date.startsWith(currentMonthStr);
    } else if (viewMode === 'yearly') {
      return matchesSearch && t.date && t.date.startsWith(currentYearStr);
    }
    return matchesSearch;
  });

  // Add Ticket (POST)
  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.customerName || !newTicket.phone || !newTicket.deviceModel || !newTicket.issue) {
      setErrorMsg('Please enter all the information!');
      return;
    }

    const ticketItem = {
      id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: newTicket.customerName,
      phone: newTicket.phone,
      deviceModel: newTicket.deviceModel,
      issue: newTicket.issue,
      status: newTicket.status,
      cost: Number(newTicket.cost) || 0,
      advance: Number(newTicket.advance) || 0
    };

    try {
      const res = await fetch('https://it-zone-invoice-server.vercel.app/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketItem)
      });
      const data = await res.json();

      if (data.success) {
        setTickets(prev => {
          const list = Array.isArray(prev) ? prev : (prev?.data || []);
          return [data.data, ...list];
        });
        setIsModalOpen(false);
        setNewTicket({
          customerName: '',
          phone: '',
          deviceModel: '',
          issue: '',
          status: 'Received',
          cost: '',
          advance: ''
        });
        setErrorMsg('');
        Swal.fire({
          title: 'Success!',
          text: 'Service ticket created successfully.',
          icon: 'success',
          background: '#111827',
          color: '#fff',
          confirmButtonColor: '#2563eb',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        setErrorMsg(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Error posting ticket:', err);
      setErrorMsg('Network error occurred');
    }
  };

  // Status Change (PATCH)
  const handleStatusChange = async (id, newStatus) => {
    const targetId = id;
    try {
      const res = await fetch(`https://it-zone-invoice-server.vercel.app/services/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();

      if (data.success) {
        setTickets(prev => {
          const list = Array.isArray(prev) ? prev : (prev?.data || []);
          return list.map(t => (t._id || t.id) === targetId ? { ...t, status: newStatus } : t);
        });
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return <span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold">Received</span>;
      case 'Diagnosing':
        return <span className="px-2.5 py-1 bg-purple-500/15 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold">Diagnosing</span>;
      case 'Repairing':
        return <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">Repairing</span>;
      case 'Ready for Delivery':
        return <span className="px-2.5 py-1 bg-green-500/15 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold">Ready for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg text-xs font-bold">Delivered</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
          <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
            Support & Maintenance
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Service & Repair Tracking</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={18} /> New Service Ticket
        </button>
      </div>

      {apiError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {apiError}
        </div>
      )}

      {/* Dynamic Summary Cards (Today, Monthly, Yearly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Today's Total Earn From Service</p>
            <h3 className="text-2xl font-extrabold text-green-400 mt-1">৳ {todaysTotalEarn.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Month's Total Earn From Service</p>
            <h3 className="text-2xl font-extrabold text-blue-400 mt-1">৳ {monthlyTotalEarn.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">This Year's Total Earn From Service</p>
            <h3 className="text-2xl font-extrabold text-purple-400 mt-1">৳ {yearlyTotalEarn.toLocaleString()}</h3>
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
          All Tickets
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

      {/* Service Tickets Table Container */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Wrench size={16} className="text-blue-400" /> 
            {viewMode === 'today' ? "Today's Service Queue" : viewMode === 'monthly' ? "Monthly Service History" : viewMode === 'yearly' ? "Yearly Service History" : "Active Service Queue"} ({filteredTickets.length})
          </h3>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Quick search by ID, name, or phone..."
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
                <th className="py-3 px-5">Ticket ID / Date</th>
                <th className="py-3 px-5">Customer Info</th>
                <th className="py-3 px-5">Device & Issue</th>
                <th className="py-3 px-5">Cost & Advance</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                // Display loading spinner while fetching data
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={32} className="text-blue-500 animate-spin" />
                      <p className="text-sm text-gray-400 font-medium">Loading service tickets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTickets.length > 0 ? (
                filteredTickets.map((t) => {
                  const isLocked = t.status === 'Delivered' || t.status === 'Cancelled';

                  return (
                    <tr key={t._id || t.id} className="hover:bg-gray-900/40 transition-all">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-blue-400 block">{t.id}</span>
                        <span className="text-xs text-gray-500">{t.date}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-white">{t.customerName}</p>
                        <p className="text-xs text-gray-400">{t.phone}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-semibold text-gray-200 flex items-center gap-1.5">
                          <Laptop size={14} className="text-blue-400 shrink-0" /> {t.deviceModel}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.issue}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <p className="font-bold text-white">Est: ৳ {t.cost}</p>
                        <p className="text-xs text-green-400">Adv: ৳ {t.advance}</p>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {getStatusBadge(t.status)}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={t.status}
                            disabled={isLocked}
                            onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                            className={`bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500 ${
                              isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <option value="Received">Received</option>
                            <option value="Diagnosing">Diagnosing</option>
                            <option value="Repairing">Repairing</option>
                            <option value="Ready for Delivery">Ready for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    No matching service tickets found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add New Service Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench size={18} className="text-blue-400" /> Create New Service Ticket
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTicket} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Name 
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahim Ahmed"
                    value={newTicket.customerName}
                    onChange={(e) => setNewTicket({...newTicket, customerName: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={newTicket.phone}
                    onChange={(e) => setNewTicket({...newTicket, phone: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Device Model / Name
                <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HP ProBook 440 G9"
                  value={newTicket.deviceModel}
                  onChange={(e) => setNewTicket({...newTicket, deviceModel: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Problem / Issue Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe the problem..."
                  value={newTicket.issue}
                  onChange={(e) => setNewTicket({...newTicket, issue: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Estimated Cost (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newTicket.cost}
                    onChange={(e) => setNewTicket({...newTicket, cost: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Advance Paid (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newTicket.advance}
                    onChange={(e) => setNewTicket({...newTicket, advance: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  Create Ticket
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}