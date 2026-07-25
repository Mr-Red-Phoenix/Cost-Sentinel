'use client';

import React from 'react';
import { AlertCircle, Zap, HardDrive, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

interface MetricCardsProps {
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    totalTokens: number;
    natBytesProcessed: number;
    vpcEndpointHits: number;
    avgCpuUtil: number;
    estimatedHourlyLeakCost: string;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Card 1: Active Cost Leaks */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <AlertCircle className="w-16 h-16 text-rose-500" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Anomalies</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-white">{summary.totalAnomalies}</span>
          <span className="text-xs text-rose-400 font-medium">
            {summary.criticalCount} Critical | {summary.highCount} High
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Classified by Sentinel Engine</p>
      </div>

      {/* Card 2: GenAI Token Rate */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-16 h-16 text-amber-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LLM Token Usage</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-white">{summary.totalTokens.toLocaleString()}</span>
          <span className="text-xs text-amber-400 font-medium">tokens/5m</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">OpenLLMetry gen_ai.* spans</p>
      </div>

      {/* Card 3: NAT Gateway Egress Volume */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <HardDrive className="w-16 h-16 text-cyan-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NAT Egress Bytes</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-white">{formatBytes(summary.natBytesProcessed)}</span>
          <span className="text-xs text-cyan-400 font-medium">{summary.vpcEndpointHits} VPC Hits</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">AWS NAT Gateway vs VPC Endpoints</p>
      </div>

      {/* Card 4: Estimated Leak Cost / Waste */}
      <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative overflow-hidden group border-rose-500/30">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <DollarSign className="w-16 h-16 text-emerald-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Hourly Leak Waste</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold text-emerald-400">${summary.estimatedHourlyLeakCost}</span>
          <span className="text-xs text-slate-400 font-medium">/ hr</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-[11px] text-rose-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Potential ${(parseFloat(summary.estimatedHourlyLeakCost) * 24 * 30).toFixed(2)}/mo waste</span>
        </div>
      </div>

    </div>
  );
};
