import { useEffect, useState } from 'react';
import Banner from '../Components/Banner';

export default function Home() {

  const [stats, setStats] = useState({
    todaysSales: 0,
    activeServicesCount: 0,
    readyServicesCount: 0,
    totalProductsCount: 0
  });

  useEffect(() => {
    document.title = "IT Zone-Inventory | Home";
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:3000/analytics/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics stats:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Banner />

      {/* Quick Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Today's Sales</p>
          <h3 className="text-2xl font-bold text-blue-400">৳ {stats.todaysSales.toLocaleString()}</h3>
          <p className="text-xs text-gray-500">Real-time database calculation</p>
        </div>
        
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Active Services</p>
          <h3 className="text-2xl font-bold text-blue-400">{stats.activeServicesCount} Devices</h3>
          <p className="text-xs text-gray-500">{stats.readyServicesCount} ready for delivery</p>
        </div>

        <div className="bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Total Products</p>
          <h3 className="text-2xl font-bold text-blue-400">{stats.totalProductsCount} Items</h3>
          <p className="text-xs text-gray-500">Live inventory count</p>
        </div>
      </div>
    </div>
  );
}