import { motion } from 'framer-motion';
import { ShieldAlert, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

const AccessDeniedModal = () => {


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-md w-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl text-center relative overflow-hidden"
      >
        {/* Background Glow Effect */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Animated Icon Badge */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: 'reverse',
            duration: 1.5,
            ease: 'easeInOut',
          }}
          className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
        >
          <ShieldAlert className="w-7 h-7" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white tracking-tight mb-2">
          Access Denied
        </h3>
        
        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          You do not have the permission to create an administration or user account.
        </p>

        {/* Info Box */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-blue-400 flex items-center justify-center gap-2 mb-6">
          <Mail className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Please contact the authority or IT Zone owner.</span>
        </div>

        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-sm font-semibold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center cursor-pointer"
          >
            Return Home
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default AccessDeniedModal;