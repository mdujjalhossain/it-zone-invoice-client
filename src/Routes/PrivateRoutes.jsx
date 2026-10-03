import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Contexts/AuthContext";

const PrivateRoutes = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] font-sans">
        <div className="flex flex-col items-center gap-6 w-80 bg-[#111827] border border-gray-800/80 p-8 rounded-3xl shadow-2xl shadow-blue-500/5 relative overflow-hidden">

          {/* Top Glow Accent */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl"></div>

          {/* Brand/Logo Loader */}
          <div className="flex items-center gap-2 relative z-10 mb-1">
            <span className="w-3 h-3 bg-blue-500 rounded-full inline-block shadow-[0_0_12px_#3b82f6] animate-ping"></span>
            <span className="text-lg font-bold tracking-wider text-white">
              Mood<span className="text-blue-500">IDM</span>
            </span>
          </div>

          {/* Animated Skeleton Lines */}
          <div className="w-full flex flex-col gap-4 animate-pulse relative z-10">
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-800/80 rounded-md"></div>
              <div className="h-6 w-6 bg-gray-800/80 rounded-full"></div>
            </div>
            <div className="h-24 w-full bg-gray-800/40 border border-gray-800/60 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-800/80 rounded-md"></div>
              <div className="h-3 w-full bg-gray-800/40 rounded-md"></div>
            </div>
          </div>

          {/* Loading Status Text */}
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-blue-400 uppercase relative z-10 mt-2">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></span>
            <span className="ml-1">Loading Content...</span>
          </div>

        </div>
      </div>
    );
  }
  
  if (user) {
    return children;
  }
  return <Navigate to="/login" state={{ from: location }} replace></Navigate>
};

export default PrivateRoutes;