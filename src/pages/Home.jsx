import { useEffect } from 'react';
import { Link } from 'react-router';
import Banner from '../Components/Banner';
import useApi from '../Components/useApi';
import { Loader2, AlertCircle, DollarSign, Wrench, Package, Briefcase } from 'lucide-react';

export default function Home() {
  const { data: rawStats, loading, error } = useApi('https://it-zone-invoice-server.vercel.app/analytics/stats');

  // Extract stats data safely
  const stats = rawStats?.data || rawStats;

  useEffect(() => {
    document.title = "IT Zone-Inventory | Home";
  }, []);

  return (
    <div className="space-y-6">
      <Banner />

      {/* Grid changed to 4 columns for balanced stats display */}
      <div className="max-w-7xl mb-10 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center gap-2 py-12 text-gray-400 text-sm bg-[#111827] border border-gray-800 rounded-xl shadow-xl">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <span>Loading analytics stats from database...</span>
          </div>
        ) : error ? (
          <div className="col-span-full flex justify-center items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>Failed to load stats: {error}</span>
          </div>
        ) : (
          <>
            {/* Today's Sales Card */}
            <Link 
              to="/invoices" 
              className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3 group hover:border-blue-500/50 hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today's Sales</p>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <DollarSign size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-blue-400">৳ {(stats?.todaysSales || 0).toLocaleString()}</h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                Product sales revenue <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </Link>

            {/* Today's Service Income Card */}
            <Link 
              to="/services" 
              className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3 group hover:border-amber-500/50 hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Today's Service Income</p>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <Briefcase size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-amber-400">৳ {(stats?.todaysServiceRevenue || 0).toLocaleString()}</h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                Service & repair earnings <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </Link>

            {/* Active Services Card */}
            <Link 
              to="/services" 
              className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3 group hover:border-purple-500/50 hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Services</p>
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Wrench size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-purple-400">{stats?.activeServicesCount || 0} Devices</h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                {stats?.readyServicesCount || 0} ready for delivery <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </Link>

            {/* Total Products Card */}
            <Link 
              to="/inventory" 
              className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-3 group hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer block"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Products</p>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Package size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-400">{stats?.totalProductsCount || 0} Items</h3>
              <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors flex items-center gap-1">
                Live inventory count <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}