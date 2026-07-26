import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  FlashIcon, 
  DatabaseIcon, 
  CpuIcon, 
  Maximize01Icon, 
  Cancel01Icon 
} from '@hugeicons/core-free-icons';
import { DashboardSummary } from '../types/sentinel';
import { useTheme } from '../hooks/useTheme';

interface AnalyticsGridProps {
  summary?: DashboardSummary;
}

// Custom Glassmorphism Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-205 text-xs p-3 rounded-xl shadow-lg min-w-[120px]">
        <div className="font-semibold text-slate-900 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">{label}</div>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }}></span>
                <span className="text-slate-505 dark:text-slate-350">{entry.name}</span>
              </span>
              <span className="font-bold" style={{ color: entry.color || entry.stroke }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Glassmorphic Tooltip for Expanded View
const ZoomedTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg p-3 min-w-[150px]">
        <div className="font-mono text-slate-500 dark:text-slate-400 text-xs mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">{label}</div>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => {
            const isIdleCpu = entry.name === 'CPU Load %' && entry.value < 5.0;
            const isTokens = entry.name === 'Tokens';
            const valueColorClass = isIdleCpu ? 'text-rose-500' : isTokens ? 'text-amber-500' : 'text-slate-900 dark:text-white';
            
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }}></span>
                  <span className="text-slate-600 dark:text-slate-300 text-xs">{entry.name}</span>
                </span>
                <span className={`font-bold font-mono text-xs ${valueColorClass}`}>
                  {isTokens ? entry.value.toLocaleString() : 
                   entry.name === 'CPU Load %' ? `${entry.value.toFixed(1)}%` : 
                   entry.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// (Removed renderCustomReferenceLabel as requested)

export function AnalyticsGrid({ summary }: AnalyticsGridProps) {
  const [activeZoomedChart, setActiveZoomedChart] = useState<'tokens' | 'egress' | 'cpu' | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Extract active metrics or fall back to default values
  const tokens = summary?.totalTokens ?? 0;
  const natBytes = summary?.natBytesProcessed ?? 0;
  const vpcHits = summary?.vpcEndpointHits ?? 0;
  const cpu = summary?.avgCpuUtil ?? 0;

  // Convert bytes to MB for display
  const natMb = Math.round(natBytes / 1000000);

  // Dynamic Time-Series State for Live Scrolling Charts
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Initialize historical data on mount
  useEffect(() => {
    setMounted(true);
    const initialData = [];
    const baseDate = new Date();
    for (let i = 14; i >= 0; i--) {
      const past = new Date(baseDate.getTime() - i * 2000);
      initialData.push({
        timestamp: past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        tokens: tokens > 0 ? Math.round(tokens * (0.6 + Math.random() * 0.8)) : 800,
        natEgressMb: natMb > 0 ? Math.round(natMb * (0.6 + Math.random() * 0.8)) : 15,
        vpcHits: vpcHits > 0 ? Math.round(vpcHits * (0.6 + Math.random() * 0.8)) : 45,
        cpuLoad: cpu > 0 ? Math.min(100, parseFloat((cpu * (0.6 + Math.random() * 0.8)).toFixed(1))) : 48
      });
    }
    setChartData(initialData);
  }, []); // Run once on mount

  // Live rolling update every 2 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Add ±20% random jitter to simulate high-activity live telemetry
        const jitter = (val: number) => val * (1 + (Math.random() * 0.40 - 0.20));
        
        const newPoint = {
          timestamp: timeLabel,
          tokens: Math.round(jitter(tokens || 800)),
          natEgressMb: Math.round(jitter(natMb || 15)),
          vpcHits: Math.round(jitter(vpcHits || 45)),
          cpuLoad: parseFloat(Math.min(100, Math.max(0, jitter(cpu || 48))).toFixed(1))
        };
        
        const nextData = [...prev, newPoint];
        return nextData.slice(nextData.length - 15);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted, tokens, natMb, vpcHits, cpu]);

  // Fallback data for SSR layout mapping
  const data = mounted && chartData.length > 0 ? chartData : [
    { timestamp: '...', tokens: 0, natEgressMb: 0, vpcHits: 0, cpuLoad: 0 },
  ];

  const chartContainerClass = "p-5 rounded-2xl border border-slate-205 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 flex flex-col h-[300px] transition-all duration-300 hover:scale-[1.01] cursor-pointer group";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Chart 1: LLM Token Burn Rate */}
      <div 
        onClick={() => setActiveZoomedChart('tokens')}
        className={chartContainerClass}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-606 dark:text-amber-400 transition-colors duration-300 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30">
              <HugeiconsIcon icon={FlashIcon} size={16} />
            </div>
            <h3 className="font-semibold text-slate-805 dark:text-slate-200 text-sm">Token Burn Rate</h3>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tracking-wider font-mono">gen_ai.* spans</span>
            <button
              onClick={() => setActiveZoomedChart('tokens')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
              title="Expand View"
            >
              <HugeiconsIcon icon={Maximize01Icon} size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" hide={true} />
              <YAxis hide={true} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#334155' : '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: NAT Egress vs VPC */}
      <div 
        onClick={() => setActiveZoomedChart('egress')}
        className={chartContainerClass}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 transition-colors duration-300 group-hover:bg-cyan-50 dark:group-hover:bg-cyan-950/30">
              <HugeiconsIcon icon={DatabaseIcon} size={16} />
            </div>
            <h3 className="font-semibold text-slate-805 dark:text-slate-200 text-sm">NAT Egress vs VPC</h3>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-205 dark:border-slate-700 tracking-wider font-mono">MB vs Hits</span>
            <button
              onClick={() => setActiveZoomedChart('egress')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
              title="Expand View"
            >
              <HugeiconsIcon icon={Maximize01Icon} size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="timestamp" hide={true} />
              <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', opacity: 0.6 }} />
              <Bar dataKey="natEgressMb" name="NAT Egress" fill="#06b6d4" radius={[3, 3, 0, 0]} maxBarSize={15} />
              <Bar dataKey="vpcHits" name="VPC Hits" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: EC2 CPU Load */}
      <div 
        onClick={() => setActiveZoomedChart('cpu')}
        className={chartContainerClass}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-606 dark:text-indigo-400 transition-colors duration-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30">
              <HugeiconsIcon icon={CpuIcon} size={16} />
            </div>
            <h3 className="font-semibold text-slate-805 dark:text-slate-200 text-sm">EC2 CPU Load %</h3>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-205 dark:border-slate-700 tracking-wider font-mono">0-100%</span>
            <button
              onClick={() => setActiveZoomedChart('cpu')}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
              title="Expand View"
            >
              <HugeiconsIcon icon={Maximize01Icon} size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="timestamp" hide={true} />
              <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide={true} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#334155' : '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Line type="monotone" dataKey="cpuLoad" name="CPU Load %" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expanded Chart Zoom Modal */}
      {activeZoomedChart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setActiveZoomedChart(null)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col p-6 sm:p-8 max-h-[90vh] backdrop-blur-xl">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${
                  activeZoomedChart === 'tokens' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                  activeZoomedChart === 'egress' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' :
                  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <HugeiconsIcon 
                    icon={
                      activeZoomedChart === 'tokens' ? FlashIcon :
                      activeZoomedChart === 'egress' ? DatabaseIcon :
                      CpuIcon
                    } 
                    size={24}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-805 dark:text-white tracking-wide">
                    {activeZoomedChart === 'tokens' && 'LLM Token Burn Rate'}
                    {activeZoomedChart === 'egress' && 'NAT Egress vs VPC Hits'}
                    {activeZoomedChart === 'cpu' && 'EC2 CPU Load %'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {activeZoomedChart === 'tokens' && 'Detailed rate analysis of token consumption from gen_ai.* semantic conventions.'}
                    {activeZoomedChart === 'egress' && 'Comparing outbound data transfer volume passing through NAT Gateways vs VPC Endpoints.'}
                    {activeZoomedChart === 'cpu' && 'Monitoring virtual machine processor load over the last 10 minutes.'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setActiveZoomedChart(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/40 cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={18} />
              </button>
            </div>

            {/* Quick KPI stats in zoomed view */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              {activeZoomedChart === 'tokens' && (
                <>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Current Rate</div>
                    <div className="text-lg font-bold text-slate-805 dark:text-slate-100 mt-1 font-mono">{tokens.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Interval</div>
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">5 minutes</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Namespace</div>
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5 font-mono">gen_ai.usage</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Status</div>
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-455 mt-1">{tokens > 1000 ? 'AI Leak' : 'Healthy'}</div>
                  </div>
                </>
              )}
              {activeZoomedChart === 'egress' && (
                <>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">NAT Volume</div>
                    <div className="text-lg font-bold text-slate-805 dark:text-slate-100 mt-1 font-mono">{(natBytes / 1e6).toFixed(1)} MB</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">VPC Hits</div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-455 mt-1 font-mono">{vpcHits}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">Egress Fee</div>
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5 font-mono">$0.045 / GB</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">VPC Endpoint</div>
                    <div className="text-lg font-bold text-rose-650 dark:text-rose-455 mt-1">{vpcHits === 0 && natBytes > 1000 ? 'Missing' : 'Active'}</div>
                  </div>
                </>
              )}
              {activeZoomedChart === 'cpu' && (
                <>
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">CPU Load</div>
                    <div className="text-lg font-bold text-slate-850 dark:text-slate-100 mt-1 font-mono">{cpu.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-505 dark:text-slate-400 font-semibold tracking-wider uppercase">VM Status</div>
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">Billed</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-505 dark:text-slate-400 font-semibold tracking-wider uppercase">Idle Threshold</div>
                    <div className="text-lg font-bold text-rose-600 dark:text-rose-455 mt-1 font-mono">&lt; 5.0%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-505 dark:text-slate-400 font-semibold tracking-wider uppercase">Allocation</div>
                    <div className="text-lg font-bold text-slate-600 dark:text-slate-350 mt-1">{cpu < 5.0 ? 'Idle/Wasting' : 'Utilized'}</div>
                  </div>
                </>
              )}
            </div>

            {/* High Definition Chart Container */}
            <div className="flex-1 w-full relative mt-2">
              <ResponsiveContainer width="100%" height={300}>
                {activeZoomedChart === 'tokens' ? (
                  <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTokensExpanded" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                    <XAxis dataKey="timestamp" stroke={isDark ? "#475569" : "#cbd5e1"} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} axisLine={true} tickLine={true} />
                    <YAxis domain={['dataMin - 100', 'dataMax + 100']} stroke={isDark ? "#475569" : "#cbd5e1"} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}K` : val} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={true} tickLine={true} />
                    <Tooltip content={<ZoomedTooltip />} cursor={{ stroke: '#f59e0b', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Area type="monotone" dataKey="tokens" name="Tokens" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTokensExpanded)" activeDot={{ r: 6, strokeWidth: 0, fill: '#f59e0b' }} />
                  </AreaChart>
                ) : activeZoomedChart === 'egress' ? (
                  <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                    <XAxis dataKey="timestamp" stroke={isDark ? "#475569" : "#cbd5e1"} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} axisLine={true} tickLine={true} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke={isDark ? "#475569" : "#cbd5e1"} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={true} tickLine={true} />
                    <Tooltip content={<ZoomedTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="natEgressMb" name="NAT Egress MB" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="vpcHits" name="VPC Hits" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                ) : (
                  <LineChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.15} />
                    <XAxis dataKey="timestamp" stroke={isDark ? "#475569" : "#cbd5e1"} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} axisLine={true} tickLine={true} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke={isDark ? "#475569" : "#cbd5e1"} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={true} tickLine={true} />
                    <Tooltip content={<ZoomedTooltip />} cursor={{ stroke: isDark ? '#475569' : '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                    <ReferenceLine y={5} stroke="#f43f5e" strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'IDLE THRESHOLD (<5%)', fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="cpuLoad" name="CPU Load %" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
