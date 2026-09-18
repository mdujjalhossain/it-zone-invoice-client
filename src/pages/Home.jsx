
import Banner from '../Components/Banner';

export default function Home() {
  return (
    <div className="space-y-6">
      <Banner />

      {/* Quick Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Today's Sales</p>
          <h3 className="text-2xl font-bold text-blue-400">৳ 83,500</h3>
          <p className="text-xs text-gray-500">+12% from yesterday</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Active Services</p>
          <h3 className="text-2xl font-bold text-blue-400">4 Laptops</h3>
          <p className="text-xs text-gray-500">2 ready for delivery</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-2">
          <p className="text-xs text-gray-400 font-semibold uppercase">Total Products</p>
          <h3 className="text-2xl font-bold text-blue-400">40+ Items</h3>
          <p className="text-xs text-gray-500">Laptops, monitors, parts</p>
        </div>
      </div>
    </div>
  );
}