import { useEffect, useState } from 'react';
import { Search, Plus, Wrench, Laptop, X } from 'lucide-react';

export default function ServiceTracking() {

    useEffect(() => {
        document.title = "IT Zone-Inventory | Service-tracking";
      }, []);

  const [tickets, setTickets] = useState([
    {
      id: 'SRV-5091',
      date: '2026-09-18',
      customerName: 'Md. Rahim Ahmed',
      phone: '01712345678',
      deviceModel: 'HP ProBook 440 G9',
      issue: 'Display flickering and sudden shutdown issue.',
      status: 'Repairing',
      cost: 1500,
      advance: 500
    },
    {
      id: 'SRV-5092',
      date: '2026-09-17',
      customerName: 'Tanvir Hossain',
      phone: '01898765432',
      deviceModel: 'Dahua 2MP CC Camera',
      issue: 'Night vision infrared not working properly.',
      status: 'Ready for Delivery',
      cost: 800,
      advance: 200
    },
    {
      id: 'SRV-5093',
      date: '2026-09-19',
      customerName: 'Nazmul Islam',
      phone: '01511223344',
      deviceModel: 'Dell Inspiron 15',
      issue: 'OS corrupted / Windows boot loop.',
      status: 'Diagnosing',
      cost: 500,
      advance: 0
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New ticket form state
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

  const filteredTickets = tickets.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm) ||
    t.deviceModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTicket = (e) => {
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

    // Functional state update ensuring immutability
    setTickets(prev => [ticketItem, ...prev]);
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
  };

  const handleStatusChange = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received':
        return <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold">Received</span>;
      case 'Diagnosing':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-bold">Diagnosing</span>;
      case 'Repairing':
        return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold">Repairing</span>;
      case 'Ready for Delivery':
        return <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold">Ready for Delivery</span>;
      case 'Delivered':
        return <span className="px-2.5 py-1 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg text-xs font-bold">Delivered</span>;
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

      {/* Service Tickets Table Container */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
        
        <div className="p-6 border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
            <Wrench size={16} className="text-blue-400" /> Active Service Queue ({filteredTickets.length})
          </h3>

          <div className="relative w-full sm:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
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
                <th className="py-3 px-5 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-900/40 transition-all">
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
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="Received">Received</option>
                        <option value="Diagnosing">Diagnosing</option>
                        <option value="Repairing">Repairing</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    Kono matching service ticket pawa jayni!
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
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahim Ahmed"
                    value={newTicket.customerName}
                    onChange={(e) => setNewTicket({...newTicket, customerName: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="017XXXXXXXX"
                    value={newTicket.phone}
                    onChange={(e) => setNewTicket({...newTicket, phone: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Device Model / Name</label>
                <input
                  type="text"
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