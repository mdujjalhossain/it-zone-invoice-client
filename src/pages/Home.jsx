import Banner from '../Components/Banner';
import useApi from '../Components/useApi';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  const { data: stats, loading, error } = useApi('https://it-zone-invoice-server.vercel.app/analytics/stats');

  if (typeof document !== 'undefined') {
    document.title = "IT Zone-Inventory | Home";
  }

  return (
    <div className="space-y-6">
      <Banner />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 flex justify-center items-center gap-2 py-12 text-gray-400 text-sm bg-[#111827] border border-gray-800 rounded-xl shadow-xl">
            <Loader2 className="animate-spin text-blue-500" size={20} />
            <span>Loading analytics stats from database...</span>
          </div>
        ) : error ? (
          <div className="col-span-3 flex justify-center items-center gap-2 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
            <AlertCircle size={18} />
            <span>Failed to load stats: {error}</span>
          </div>
        ) : (
          <>
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase">Today's Sales</p>
              <h3 className="text-2xl font-bold text-blue-400">৳ {(stats?.todaysSales || 0).toLocaleString()}</h3>
              <p className="text-xs text-gray-500">Real-time database calculation</p>
            </div>
            
            <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase">Active Services</p>
              <h3 className="text-2xl font-bold text-blue-400">{stats?.activeServicesCount || 0} Devices</h3>
              <p className="text-xs text-gray-500">{stats?.readyServicesCount || 0} ready for delivery</p>
            </div>

            <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
              <p className="text-xs text-gray-400 font-semibold uppercase">Total Products</p>
              <h3 className="text-2xl font-bold text-blue-400">{stats?.totalProductsCount || 0} Items</h3>
              <p className="text-xs text-gray-500">Live inventory count</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}