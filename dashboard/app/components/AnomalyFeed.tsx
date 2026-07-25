'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ChevronRight, Code2, Wrench, ShieldAlert } from 'lucide-react';

interface Anomaly {
  id: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
  recommendation: string;
  codeSnippet: string;
  timestamp: string;
}

interface AnomalyFeedProps {
  anomalies: Anomaly[];
  onSelectAnomaly: (anomaly: Anomaly) => void;
}

export const AnomalyFeed: React.FC<AnomalyFeedProps> = ({ anomalies, onSelectAnomaly }) => {
  const getSeverityBadge = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 glow-red">
            <AlertCircle className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 glow-amber">
            <AlertTriangle className="w-3.5 h-3.5" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white">Classified Cost Leaks & Remediation</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {anomalies.length} active classifications
        </span>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-8 text-center glass-panel rounded-xl border border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Cost Leaks Detected</h3>
          <p className="text-xs text-slate-400 mt-1">All telemetry signals are within normal baseline thresholds.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              onClick={() => onSelectAnomaly(anomaly)}
              className="glass-panel glass-panel-hover p-5 rounded-xl border border-slate-800/90 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getSeverityBadge(anomaly.severity)}
                  <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {anomaly.category}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(anomaly.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {anomaly.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {anomaly.description}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <Wrench className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-300">Fix:</span>
                  <span className="text-cyan-300 font-mono text-[11px] truncate">{anomaly.recommendation}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all group-hover:border-indigo-400">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>View Code Fix</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
