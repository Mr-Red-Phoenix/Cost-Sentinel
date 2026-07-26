import React, { useState } from 'react';
import { X, Copy, Check, Wrench, ShieldAlert, Cpu } from 'lucide-react';
import { Anomaly } from '../types/sentinel';

interface FixDrawerProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export function FixDrawer({ anomaly, onClose }: FixDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!anomaly) return null;

  const handleCopy = () => {
    if (anomaly.codeSnippet) {
      navigator.clipboard.writeText(anomaly.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const severityColor = 
    anomaly.severity === 'CRITICAL' ? 'text-rose-700 bg-rose-50 border border-rose-200' :
    anomaly.severity === 'HIGH' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
    'text-yellow-705 bg-yellow-50 border border-yellow-200';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${severityColor}`}>
                {anomaly.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-650 border border-slate-200">
                {anomaly.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 leading-tight">{anomaly.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Root Cause Analysis */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              Root Cause Analysis
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-250/80 text-slate-705 text-sm leading-relaxed">
              {anomaly.description}
            </div>
          </div>

          {/* Remediation Action */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-indigo-650 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-500" />
              Remediation Action
            </h3>
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 text-indigo-900 text-sm leading-relaxed">
              {anomaly.recommendation}
            </div>
          </div>

          {/* Automated Fix Snippet */}
          {anomaly.codeSnippet && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-655" />
                  Automated Fix
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition-colors border border-slate-200"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> <span className="text-emerald-600">Copied!</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Code</>
                  )}
                </button>
              </div>
              <div className="relative group">
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-950 overflow-x-auto">
                  <code className="text-xs sm:text-sm font-mono text-cyan-400 leading-relaxed whitespace-pre-wrap block">
                    {anomaly.codeSnippet}
                  </code>
                </pre>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </>
  );
}
