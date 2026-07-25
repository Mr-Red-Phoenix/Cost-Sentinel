'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Activity, Server, Cpu } from 'lucide-react';

interface TelemetryChartsProps {
  metrics: {
    totalTokens: number;
    natBytesProcessed: number;
    vpcEndpointHits: number;
    avgCpuUtil: number;
  };
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ metrics }) => {
  // Generate smooth time series data for demonstration visuals
  const timeSeriesData = [
    { time: '10m ago', tokens: 800, natBytes: 15, vpcHits: 45, cpu: 48 },
    { time: '8m ago', tokens: 1200, natBytes: 22, vpcHits: 50, cpu: 52 },
    { time: '6m ago', tokens: 1100, natBytes: 18, vpcHits: 48, cpu: 42 },
    { time: '4m ago', tokens: 3500, natBytes: 65, vpcHits: 5, cpu: 12 },
    { time: '2m ago', tokens: 4900, natBytes: 95, vpcHits: 0, cpu: 4 },
    { time: 'Now', tokens: metrics.totalTokens || 5420, natBytes: Math.round((metrics.natBytesProcessed || 105000000) / 1000000), vpcHits: metrics.vpcEndpointHits || 0, cpu: metrics.avgCpuUtil || 3.2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Chart 1: AI Token Usage & Context Stuffing */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">LLM Token Burn Rate</h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            gen_ai.* spans
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Area type="monotone" dataKey="tokens" name="Tokens / 5m" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#tokenGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: AWS NAT Egress vs VPC Endpoint Hits */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">NAT Egress vs VPC Hits</h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            MB vs Hits
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="natBytes" name="NAT Egress (MB)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vpcHits" name="VPC Endpoint Hits" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Compute CPU Utilization */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-200">EC2 CPU Load (%)</h3>
          </div>
          <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Idle Threshold &lt; 5%
          </span>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Area type="monotone" dataKey="cpu" name="CPU Load %" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#cpuGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
