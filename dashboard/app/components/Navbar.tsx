'use client';

import React from 'react';
import { ShieldAlert, Activity, Cpu, Bot, ExternalLink, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface NavbarProps {
  status: string;
  isSimulated: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ status, isSimulated, onRefresh, isRefreshing }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'CRITICAL_LEAK':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold text-xs animate-pulse glow-red">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>CRITICAL LEAKS DETECTED</span>
          </div>
        );
      case 'HIGH_LEAK':
      case 'WARNING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs glow-amber">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>COST LEAKS ACTIVE</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-xs glow-cyan">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>SYSTEM HEALTHY</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  COST SENTINEL
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  OTel + SigNoz
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous AI & Infra Cost Leak Engine</p>
            </div>
          </div>

          {/* System Status & Port Services */}
          <div className="hidden md:flex items-center gap-4">
            {getStatusBadge()}

            {/* Ports Status Indicators */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
              <a
                href="http://localhost:8080"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
                title="SigNoz Dashboard UI"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-slate-400">SigNoz UI</span>
                <span className="text-cyan-400 font-semibold">:8080</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <span className="text-slate-700">|</span>

              <a
                href="http://localhost:8000/mcp"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-400 transition-colors"
                title="SigNoz MCP Server Endpoint"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono text-slate-400">MCP</span>
                <span className="text-indigo-400 font-semibold">:8000</span>
              </a>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
