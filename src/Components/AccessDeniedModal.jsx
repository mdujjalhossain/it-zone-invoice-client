import { ShieldAlert, Mail } from 'lucide-react';

export default function AccessDeniedModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-center relative">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4 shadow-inner">
          <ShieldAlert size={24} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-white">Access Denied</h3>
        
        {/* Description */}
        <p className="text-sm text-gray-400 mt-2">
          You do not have the permission to create an administration or user account.
        </p>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-blue-400 flex items-center justify-center gap-2">
          <Mail size={16} className="shrink-0" />
          <span>Please contact the authority or IT Zone owner.</span>
        </div>

        {/* Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
}