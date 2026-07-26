import React from 'react';
import { ShieldAlert, Zap, HardDrive, DollarSign } from 'lucide-react';
import { DashboardSummary } from '../types/sentinel';

interface MetricCardsProps {
  summary?: DashboardSummary;
  isLoading?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function MetricCards({ summary, isLoading }: MetricCardsProps) {
  // Loading Skeleton State
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-2xl bg-white/50 dark:bg-slate-800/50 animate-pulse border border-white/40 dark:border-slate-700/50 shadow-sm"></div>
        ))}
      </div>
    );
  }

  const {
    totalAnomalies,
    criticalCount,
    highCount,
    totalTokens,
    natBytesProcessed,
    vpcEndpointHits,
    estimatedHourlyLeakCost,
  } = summary;

  const costHourly = parseFloat(estimatedHourlyLeakCost) || 0;
  const costMonthly = costHourly * 24 * 30;

  // Determine glow style for Card 1 based on critical anomalies
  const anomalyBorderClass = criticalCount > 0 
    ? "border-rose-300 dark:border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] dark:shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:border-rose-400" 
    : highCount > 0 
      ? "border-amber-300 dark:border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] dark:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400"
      : "border-white/40 dark:border-slate-700/60 hover:border-white/60 dark:hover:border-slate-650";

  const baseCardClass = "relative overflow-hidden group p-5 rounded-2xl bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl dark:shadow-2xl shadow-slate-950/20 dark:shadow-slate-950/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] border";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Active Anomalies */}
      <div className={`${baseCardClass} ${anomalyBorderClass}`}>
        <div className="absolute -right-4 -bottom-4 opacity-[0.06] dark:opacity-5 text-slate-900 dark:text-slate-400 pointer-events-none transition-transform group-hover:scale-110 duration-500">
          <ShieldAlert className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 transition-all duration-300 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:bg-rose-50 dark:group-hover:bg-rose-950/30 group-hover:border-rose-200 dark:group-hover:border-rose-800 shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase">Active Anomalies</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono mb-1">{totalAnomalies}</div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold ${criticalCount > 0 ? "text-rose-600 dark:text-rose-455" : "text-slate-500"}`}>{criticalCount} Critical</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              <span className={`text-[11px] font-semibold ${highCount > 0 ? "text-amber-600 dark:text-amber-455" : "text-slate-500"}`}>{highCount} High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: LLM Token Usage */}
      <div className={`${baseCardClass} border-white/40 dark:border-slate-700/60 hover:border-white/60 dark:hover:border-slate-650`}>
        <div className="absolute -right-4 -bottom-4 opacity-[0.06] dark:opacity-5 text-slate-900 dark:text-slate-400 pointer-events-none transition-transform group-hover:scale-110 duration-500">
          <Zap className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 transition-all duration-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 group-hover:border-amber-200 dark:group-hover:border-amber-800 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase">LLM Token Usage</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono mb-1">{totalTokens.toLocaleString()}</div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-455 font-semibold">tokens / 5m</span> interval
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: NAT Egress Volume */}
      <div className={`${baseCardClass} border-white/40 dark:border-slate-700/60 hover:border-white/60 dark:hover:border-slate-650`}>
        <div className="absolute -right-4 -bottom-4 opacity-[0.06] dark:opacity-5 text-slate-900 dark:text-slate-400 pointer-events-none transition-transform group-hover:scale-110 duration-500">
          <HardDrive className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 transition-all duration-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/30 group-hover:border-cyan-200 dark:group-hover:border-cyan-800 shadow-sm">
              <HardDrive className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase">NAT Egress Volume</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono mb-1">{formatBytes(natBytesProcessed)}</div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className={vpcEndpointHits > 0 ? "text-emerald-600 dark:text-emerald-455 font-semibold" : "text-slate-550 dark:text-slate-450"}>
                {vpcEndpointHits.toLocaleString()} VPC Hits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Estimated Hourly Leak Waste */}
      <div className={`${baseCardClass} border-white/40 dark:border-slate-700/60 hover:border-white/60 dark:hover:border-slate-650`}>
        <div className="absolute -right-4 -bottom-4 opacity-[0.06] dark:opacity-5 text-slate-900 dark:text-slate-400 pointer-events-none transition-transform group-hover:scale-110 duration-500">
          <DollarSign className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-400 transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-200 dark:group-hover:border-emerald-800 shadow-sm">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase">Est. Leak Waste</h3>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-455 font-mono mb-1">${costHourly.toFixed(4)} <span className="text-sm text-slate-500 dark:text-slate-450 font-normal font-sans">/ hr</span></div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="text-rose-600 dark:text-rose-455 font-semibold">Projected: </span>
              ${costMonthly.toFixed(2)}/mo waste
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
