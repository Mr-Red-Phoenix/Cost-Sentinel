import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Wrench, ChevronRight } from 'lucide-react';
import { Anomaly } from '../types/sentinel';

interface AnomalyFeedProps {
  anomalies: Anomaly[];
  onSelectAnomaly: (anomaly: Anomaly) => void;
}

export function AnomalyFeed({ anomalies, onSelectAnomaly }: AnomalyFeedProps) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="p-8 rounded-2xl border bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-slate-950/50 transition-all duration-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-650 hover:bg-white dark:hover:bg-slate-900/95 flex flex-col items-center justify-center text-center mt-8">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800/50 mb-4">
          <ShieldAlert className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-350">No Anomalies Detected</h3>
        <p className="text-sm text-slate-600 dark:text-slate-500 mt-2 max-w-md">The Cost Sentinel classification engine hasn't detected any ongoing resource leaks or anomalous token burn events.</p>
      </div>
    );
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return { wrapper: 'border-rose-500/40 hover:border-rose-500/60 shadow-rose-500/10 dark:shadow-rose-950/30', icon: 'text-rose-600 dark:text-rose-455', pill: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-455' };
      case 'HIGH':
        return { wrapper: 'border-amber-500/40 hover:border-amber-500/60 shadow-amber-500/10 dark:shadow-amber-950/30', icon: 'text-amber-600 dark:text-amber-455', pill: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-455' };
      case 'MEDIUM':
        return { wrapper: 'border-yellow-500/40 hover:border-yellow-500/60 shadow-yellow-500/10 dark:shadow-yellow-950/30', icon: 'text-yellow-600 dark:text-yellow-455', pill: 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-455' };
      default:
        return { wrapper: 'border-slate-300 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-650 shadow-slate-200/40 dark:shadow-slate-950/50', icon: 'text-slate-500 dark:text-slate-400', pill: 'bg-slate-205 dark:bg-slate-700 text-slate-700 dark:text-slate-300' };
    }
  };

  const getSeverityIcon = (severity: string, className: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertCircle className={className} />;
      case 'HIGH': return <AlertTriangle className={className} />;
      default: return <Info className={className} />;
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">Active Anomaly Feed</h2>
      </div>

      <div className="flex flex-col gap-4">
        {anomalies.map((anomaly) => {
          const styles = getSeverityStyles(anomaly.severity);
          
          return (
            <div key={anomaly.id} className={`p-5 rounded-2xl border bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 transition-all duration-300 hover:bg-white dark:hover:bg-slate-900/95 hover:-translate-y-0.5 ${styles.wrapper}`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${styles.pill}`}>
                      {getSeverityIcon(anomaly.severity, "w-3 h-3")}
                      {anomaly.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {anomaly.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(anomaly.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-205 mb-1">{anomaly.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{anomaly.description}</p>
                  
                  {/* Inline Fix Preview Banner */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/50">
                    <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Recommendation:</span> {anomaly.recommendation}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-center md:justify-start shrink-0">
                  <button 
                    onClick={() => onSelectAnomaly(anomaly)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20 group"
                  >
                    View Code Fix
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
