import { motion } from 'framer-motion';
import { ArrowLeft, Construction, Sparkles } from 'lucide-react';
// import { Construction, ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

const UnderDevelopment = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[90vh] bg-[#0b0f19] text-gray-100 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Subtle Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full text-center relative z-10 bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl"
      >
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
          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
        >
          <Construction className="w-8 h-8" />
        </motion.div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Work in Progress</span>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          We are building the exciting items for you. Please check back soon!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

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
export default UnderDevelopment;