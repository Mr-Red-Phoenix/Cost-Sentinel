import React from 'react';
import { Bot, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  status: string;
  isSimulated: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Navbar({ status, isSimulated, onRefresh, isRefreshing }: NavbarProps) {
  const getStatusText = () => {
    switch (status) {
      case 'CRITICAL_LEAK':
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            CRITICAL LEAKS
          </span>
        );
      case 'HIGH_LEAK':
      case 'WARNING':
        return (
          <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            WARNING LEAK
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            SYSTEM HEALTHY
          </span>
        );
    }
  };

  return (
    <div className="sticky top-4 z-50 mb-6 w-full max-w-5xl mx-auto px-4 flex justify-center">
      <nav className="w-full bg-white/95 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-cyan-950/20 rounded-2xl sm:rounded-full px-5 py-3 flex items-center justify-between transition-all">
        
        {/* Left: Logo Circular Badge & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden transition-transform hover:scale-105 duration-200 shrink-0">
            <img src="/logo.png" alt="Cost Sentinel Logo" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-sm font-black text-slate-900 dark:text-white tracking-wider leading-none">
              COST SENTINEL
            </span>
            <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-500 tracking-widest mt-0.5 flex items-center gap-0.5">
              OTel.Telemetry
            </span>
          </div>
        </div>

        {/* Middle: Links & Live Status */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="http://localhost:18080" 
            target="_blank" 
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/40 text-xs text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5"
          >
            SigNoz UI
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          
          <a 
            href="http://localhost:8000/mcp" 
            target="_blank" 
            rel="noreferrer"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700/40 text-xs text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5"
          >
            MCP Server
            <Bot className="w-3 h-3 opacity-60" />
          </a>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700/50 mx-2"></div>

          {/* Live Status */}
          {getStatusText()}
        </div>

        {/* Right: Refresh Button & Theme Toggle */}
        <div className="shrink-0 flex items-center gap-3">
          <ThemeToggle />
          
          {/* Mobile-only status indicator */}
          <div className="md:hidden">
            {getStatusText()}
          </div>
          
          <motion.button
            onClick={onRefresh}
            disabled={isRefreshing}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-white text-xs font-semibold tracking-wide border border-white/20 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed select-none flex items-center gap-2 group cursor-pointer"
          >
            {/* Bouncy / spring rotation for the icon */}
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              whileHover={isRefreshing ? undefined : { rotate: 180 }}
              transition={
                isRefreshing 
                  ? { repeat: Infinity, duration: 1, ease: "linear" } 
                  : { type: "spring", stiffness: 200, damping: 10 }
              }
              className="shrink-0 flex items-center justify-center"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" />
            </motion.div>
            <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
          </motion.button>
        </div>

      </nav>
    </div>
  );
}
