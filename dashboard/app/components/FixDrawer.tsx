'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Code2, Wrench, ShieldCheck, Terminal } from 'lucide-react';

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

interface FixDrawerProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export const FixDrawer: React.FC<FixDrawerProps> = ({ anomaly, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!anomaly) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(anomaly.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-700/80 shadow-2xl p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                Remediation Fix • {anomaly.category}
              </span>
              <h2 className="text-base font-bold text-white">{anomaly.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Root Cause Details */}
        <div className="space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-slate-300 mb-1">Root Cause Analysis</h4>
            <p className="text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
              {anomaly.description}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-300 mb-1">Recommended Remediation Action</h4>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{anomaly.recommendation}</span>
            </div>
          </div>

          {/* Code Snippet Fix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Automated Fix Snippet</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs overflow-x-auto">
              <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed">
                {anomaly.codeSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-lg shadow-cyan-600/20"
          >
            Close Remediation Guide
          </button>
        </div>

      </div>
    </div>
  );
};
