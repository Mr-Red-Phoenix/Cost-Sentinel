'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { TelemetryCharts } from './components/TelemetryCharts';
import { AnomalyFeed } from './components/AnomalyFeed';
import { SimulatorPanel } from './components/SimulatorPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { FixDrawer } from './components/FixDrawer';
import { ShieldCheck, Bot, Sparkles, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);

  const fetchAnomalies = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/anomalies');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch anomalies:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 5000); // 5s polling
    return () => clearInterval(interval);
  }, [fetchAnomalies]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-sm font-bold text-white tracking-wide">Initializing Cost Sentinel Dashboard...</h2>
          <p className="text-xs text-slate-400 mt-1">Connecting to SigNoz PromQL & OTel Collector</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {
    totalAnomalies: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    totalTokens: 0,
    natBytesProcessed: 0,
    vpcEndpointHits: 0,
    avgCpuUtil: 0,
    estimatedHourlyLeakCost: '0.0000',
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        status={data?.status || 'HEALTHY'}
        isSimulated={data?.isSimulated || false}
        onRefresh={fetchAnomalies}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Announcement */}
        <div className="mb-6 glass-panel p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-indigo-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Autonomous Cost Leak Detection Active</h2>
              <p className="text-xs text-slate-300">
                Evaluating GenAI agent loops, AWS NAT Gateway data egress, & idle compute across pure OpenTelemetry spans.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="http://localhost:8080"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              Open SigNoz UI
            </a>
          </div>
        </div>

        {/* Hero KPI Metric Cards */}
        <MetricCards summary={summary} />

        {/* Live Traffic Simulator Control Panel */}
        <SimulatorPanel onScenarioTriggered={fetchAnomalies} />

        {/* Multi-Signal Telemetry Charts */}
        <TelemetryCharts
          metrics={{
            totalTokens: summary.totalTokens,
            natBytesProcessed: summary.natBytesProcessed,
            vpcEndpointHits: summary.vpcEndpointHits,
            avgCpuUtil: summary.avgCpuUtil,
          }}
        />

        {/* SigNoz Native vs Cost Sentinel Side-by-Side Comparison */}
        <ComparisonPanel anomalies={data?.anomalies || []} />

        {/* Classified Cost Leaks Feed */}
        <AnomalyFeed
          anomalies={data?.anomalies || []}
          onSelectAnomaly={(anomaly) => setSelectedAnomaly(anomaly)}
        />

      </main>

      {/* Remediation Drawer / Code Fix Modal */}
      <FixDrawer
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />

    </div>
  );
}
