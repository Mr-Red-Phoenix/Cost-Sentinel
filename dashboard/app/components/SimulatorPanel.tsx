'use client';

import React, { useState } from 'react';
import { Play, Flame, Server, Cpu, RefreshCw, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';

interface SimulatorPanelProps {
  onScenarioTriggered: () => void;
}

export const SimulatorPanel: React.FC<SimulatorPanelProps> = ({ onScenarioTriggered }) => {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const runScenario = async (scenario: string, label: string) => {
    setActiveScenario(scenario);
    setStatusMsg(`Running ${label}...`);
    setLogs('');

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, count: 2, duration: 10 }),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg(`[OK] ${label} completed successfully.`);
        setLogs(data.output || 'Scenario executed cleanly.');
        onScenarioTriggered();
      } else {
        setStatusMsg(`[WARN] ${data.error || 'Execution encountered warnings'}`);
        setLogs(data.stderr || data.output || 'Check Python logs.');
      }
    } catch (err: any) {
      setStatusMsg(`[ERROR] Failed to execute scenario: ${err.message}`);
    } finally {
      setActiveScenario(null);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Live Traffic Scenario Simulator</h2>
        </div>
        <span className="text-xs text-slate-400">Trigger telemetry payloads & evaluate classifier</span>
      </div>

      {/* Simulator Control Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-4">
        
        {/* Button 1: Normal Traffic */}
        <button
          onClick={() => runScenario('normal', 'Normal Traffic Simulation')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-slate-800 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">HEALTHY</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
              Normal Traffic
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Healthy 15-word requests</p>
          </div>
        </button>

        {/* Button 2: AI Agent Loop */}
        <button
          onClick={() => runScenario('agent_loop', 'AI Agent Loop Storm')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-amber-500/30 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 glow-amber">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">HIGH LEAK</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
              AI Agent Loop
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">4x Depth retry storm</p>
          </div>
        </button>

        {/* Button 3: Infra Egress Leak */}
        <button
          onClick={() => runScenario('infra_leak', 'Unrouted NAT Egress')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-rose-500/30 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 glow-red">
              <Server className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-semibold">CRITICAL</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors">
              Infra Egress Leak
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">105MB NAT & 0 VPC Hits</p>
          </div>
        </button>

        {/* Button 4: Idle Resource */}
        <button
          onClick={() => runScenario('idle_resource', 'Idle EC2 Resource')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-yellow-500/30 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-yellow-400 font-semibold">MEDIUM</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-yellow-400 transition-colors">
              Idle Compute
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">CPU &lt; 3.0% billed idle</p>
          </div>
        </button>

        {/* Button 5: Agent Sentinel - Bad Retrieval */}
        <button
          onClick={() => runScenario('bad_retrieval', 'Bad Retrieval Simulation')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-rose-500/30 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50 bg-rose-950/20"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-rose-300 font-semibold">RAG FAIL</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
              Bad Retrieval
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Irrelevant Context (0.15)</p>
          </div>
        </button>

        {/* Button 6: Agent Sentinel - Bad Decision */}
        <button
          onClick={() => runScenario('bad_decision', 'Bad Decision Simulation')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-amber-500/30 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50 bg-amber-950/20"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <AlertCircle className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-semibold">AGENT FAIL</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
              Bad Agent Decision
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Ungrounded LLM (0.20)</p>
          </div>
        </button>

        {/* Button 7: Run Sentinel Evaluator */}
        <button
          onClick={() => runScenario('sentinel_run', 'Sentinel Classifier Cycle')}
          disabled={activeScenario !== null}
          className="p-3.5 rounded-xl glass-panel glass-panel-hover border-indigo-500/40 text-left flex flex-col justify-between group active:scale-95 transition-all disabled:opacity-50 bg-indigo-950/30"
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 glow-cyan">
              <RefreshCw className={`w-4 h-4 ${activeScenario === 'sentinel_run' ? 'animate-spin' : ''}`} />
            </span>
            <span className="text-[10px] font-mono text-indigo-300 font-semibold">SENTINEL</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
              Evaluate Sentinel
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Run sentinel.py cycle</p>
          </div>
        </button>

      </div>

      {/* Terminal Log Console Output */}
      {statusMsg && (
        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/90 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Scenario Output Log</span>
            <span className="text-[10px] text-slate-500">{statusMsg}</span>
          </div>
          <pre className="text-[11px] text-slate-300 overflow-x-auto max-h-40 whitespace-pre-wrap leading-relaxed">
            {logs || statusMsg}
          </pre>
        </div>
      )}
    </div>
  );
};
