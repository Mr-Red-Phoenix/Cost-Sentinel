import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusBannerProps {
  status: string;
  totalAnomalies: number;
}

export function StatusBanner({ status, totalAnomalies }: StatusBannerProps) {
  const isAnomalous = totalAnomalies > 0;
  return (
    <motion.div 
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`mb-8 overflow-hidden relative p-6 rounded-2xl border bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-slate-950/20 transition-all duration-300 ${isAnomalous ? 'border-amber-500/40 hover:border-amber-500/60' : 'border-white/40 dark:border-slate-700/60 hover:border-white/60 dark:hover:border-slate-600/80'}`}
    >
      
      {/* Subtle Background Glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/85 text-slate-700 dark:text-slate-350 shadow-sm transition-all duration-300">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              Autonomous Cost Leak Detection Active
              {totalAnomalies > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] border border-amber-500/30 font-semibold tracking-wide uppercase">
                  {totalAnomalies} {totalAnomalies === 1 ? 'Leak' : 'Leaks'} Detected
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Evaluating GenAI agent loops, AWS NAT Gateway data egress, & idle compute across pure OpenTelemetry spans in real-time.
            </p>
          </div>
        </div>
        
        <div className="flex items-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="http://localhost:18080"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-sm font-semibold transition-all hover:shadow-lg"
          >
            Open SigNoz UI
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
