
import { ShoppingCart, Package } from 'lucide-react';
import { Link } from 'react-router';

export default function Banner() {
  return (
    <div className="max-w-7xl mx-auto bg-[#111827] border border-gray-800 p-8 rounded-xl shadow-xl space-y-4">
      <span className="text-xs uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
        Welcome to IT ZONE
      </span>
      <h1 className="text-3xl md:text-4xl font-extrabold text-white  mt-2">
        Shop Management & POS Portal
      </h1>
      <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
        Manage your daily laptop sales, monitor stocks, customer invoices, and laptop servicing status efficiently from one centralized cloud dashboard.
      </p>
      
      <div className="pt-4 flex flex-wrap gap-4">
        <Link
          to="/billing"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <ShoppingCart size={16} /> Open POS / Billing Screen
        </Link>
        <Link
          to="/inventory"
          className="px-6 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          <Package size={16} /> View Inventory
        </Link>
      </div>
    </div>
  );
}