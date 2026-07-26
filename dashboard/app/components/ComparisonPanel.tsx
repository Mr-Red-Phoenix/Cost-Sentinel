'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, ExternalLink, Zap, HelpCircle } from 'lucide-react';

interface ComparisonPanelProps {
  anomalies: any[];
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({ anomalies }) => {
  const activeLeak = anomalies.find(a => a.severity === 'CRITICAL' || a.severity === 'HIGH') || anomalies[0];

  return (
    <div className="glass-panel p-6 rounded-2xl mb-6 border border-slate-800">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">SigNoz Native vs. Cost Sentinel Value Add</h2>
        </div>
        <span className="text-xs text-slate-400 font-mono">Side-by-Side Live Comparison</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Native SigNoz Anomaly Alert */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-3 text-slate-400">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Standard SigNoz Anomaly Alert</h3>
          </div>

          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono space-y-2 text-slate-300">
            <div className="flex justify-between border-b border-amber-500/20 pb-2">
              <span className="text-slate-400">Query Target:</span>
              <span className="text-amber-400">aws_nat_bytes_processed_total</span>
            </div>
            <div className="flex justify-between border-b border-amber-500/20 pb-2">
              <span className="text-slate-400">Anomaly Deviation:</span>
              <span className="text-rose-400">+4.8σ (Z-Score)</span>
            </div>
            <div className="flex justify-between border-b border-amber-500/20 pb-2">
              <span className="text-slate-400">Status:</span>
              <span className="text-amber-400">FIRING</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 italic">
              ⚠️ Native Alert output: Signals that a statistical deviation occurred on metric data point. Root cause, business category, and resolution code remain unknown.
            </div>
          </div>
        </div>

        {/* Right Column: Cost Sentinel Added Value */}
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-indigo-950/20 glow-cyan">
          <div className="flex items-center gap-2 mb-3 text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Cost Sentinel Autonomous Classification</h3>
          </div>

          {activeLeak ? (
            <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 font-medium">Category:</span>
                <span className="font-bold text-cyan-300">{activeLeak.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 font-medium">Verdict:</span>
                <span className="font-bold text-rose-400">{activeLeak.title}</span>
              </div>
              <div className="border-b border-cyan-500/20 pb-2">
                <span className="text-slate-400 font-medium block mb-1">Prescriptive Remediation Fix:</span>
                <span className="text-emerald-300 font-mono text-[11px] block">{activeLeak.recommendation}</span>
              </div>
              {activeLeak.traceUrl && (
                <div className="pt-1">
                  <a
                    href={activeLeak.traceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Evidence Trace in SigNoz UI</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>System healthy. No active cost leaks detected.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
