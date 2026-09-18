import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'POS / Billing', path: '/pos' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Service Tracking', path: '/service' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-[#111827] border-b border-gray-800 sticky top-0 z-50 mb-10">
      {/* Container wrapper for max-width and centering */}
      <div className="max-w-7xl mx-auto w-full px-6 h-16 flex items-center justify-between relative">
        
        {/* Brand / Logo section */}
        <div className="flex items-center space-x-3">
          <span className="text-lg font-extrabold text-blue-400 tracking-wider">IT ZONE</span>
          {/* <span className="text-xs px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold hidden sm:inline-block">
            Savar Sena Complex
          </span> */}
        </div>

        {/* Desktop Menu Links */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive(link.path)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden text-gray-400 hover:text-white p-2"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 md:hidden bg-[#111827] border-b border-gray-800 px-6 py-4 space-y-2 z-40 shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive(link.path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}