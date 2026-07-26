import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Activity, Zap, HardDrive, Cpu, ShieldCheck, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulatorPanelProps {
  onScenarioTriggered: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export function SimulatorPanel({ onScenarioTriggered }: SimulatorPanelProps) {
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message,
      },
    ]);
  };

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const triggerScenario = async (scenario: string, name: string) => {
    if (isRunning) return;
    setIsRunning(scenario);
    addLog(`> Initiating scenario: ${name}...`);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      
      if (data.success) {
        addLog(`[OK] Scenario executed successfully.`);
        if (data.output) {
          const lines = data.output.split('\n').filter((l: string) => l.trim() !== '');
          lines.forEach((line: string) => addLog(line));
        }
      } else {
        addLog(`[ERROR] Scenario execution failed: ${data.error}`);
        if (data.stderr) {
          addLog(data.stderr);
        }
      }
    } catch (err: any) {
      addLog(`[CRITICAL] Network or execution error: ${err.message}`);
    } finally {
      setIsRunning(null);
      addLog(`> Refreshing telemetry data...`);
      onScenarioTriggered();
    }
  };

  const formatLogMessage = (msg: string) => {
    // Escape HTML first (rudimentary) to prevent XSS
    let formatted = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    formatted = formatted
      .replace(/\[(OK|SUCCESS)\]/g, '<span class="text-emerald-600 dark:text-emerald-400 font-bold">$&</span>')
      .replace(/\[(WARN|LEAK)\]/g, '<span class="text-amber-650 dark:text-amber-400 font-bold">$&</span>')
      .replace(/\[(ERROR|CRITICAL|CRITICAL_LEAK)\]/g, '<span class="text-rose-650 dark:text-rose-400 font-bold">$&</span>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Control Panel */}
      <div className="p-5 sm:p-6 rounded-2xl border bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-slate-950/50 transition-all duration-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-350 hover:bg-white dark:hover:bg-slate-900/95">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-wide">Live Traffic Simulator</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Normal Traffic */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerScenario('normal', 'Normal Traffic')}
            disabled={isRunning !== null}
            className={`relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg'
            } border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10`}
          >
            <div className="flex w-full justify-between items-center mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-450"><CheckCircle2 className="w-4 h-4" /></div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 uppercase">HEALTHY</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Normal Traffic</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Standard API requests with healthy token burn.</p>
            {isRunning === 'normal' && <Play className="w-4 h-4 text-emerald-600 absolute bottom-4 right-4 animate-pulse" />}
          </motion.button>

          {/* AI Agent Loop */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerScenario('agent_loop', 'AI Agent Loop')}
            disabled={isRunning !== null}
            className={`relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10 dark:hover:shadow-amber-950/20'
            } border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10`}
          >
            <div className="flex w-full justify-between items-center mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-605 dark:text-amber-450"><Zap className="w-4 h-4" /></div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-450 uppercase">HIGH LEAK</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">AI Agent Loop</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Triggers a 4x depth retry storm with massive token burn.</p>
            {isRunning === 'agent_loop' && <Play className="w-4 h-4 text-amber-600 absolute bottom-4 right-4 animate-pulse" />}
          </motion.button>

          {/* Infra Egress Leak */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerScenario('infra_leak', 'Infra Egress Leak')}
            disabled={isRunning !== null}
            className={`relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/10 dark:hover:shadow-rose-950/20'
            } border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10`}
          >
            <div className="flex w-full justify-between items-center mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-450"><HardDrive className="w-4 h-4" /></div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-500/20 text-rose-600 uppercase">CRITICAL</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Infra Egress Leak</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Simulates unrouted NAT Gateway traffic egress.</p>
            {isRunning === 'infra_leak' && <Play className="w-4 h-4 text-rose-600 absolute bottom-4 right-4 animate-pulse" />}
          </motion.button>

          {/* Idle Compute */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerScenario('idle_resource', 'Idle Compute')}
            disabled={isRunning !== null}
            className={`relative group flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-500/10 dark:hover:shadow-yellow-950/20'
            } border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10`}
          >
            <div className="flex w-full justify-between items-center mb-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-450"><Cpu className="w-4 h-4" /></div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-yellow-500/20 text-yellow-600 uppercase">MEDIUM</span>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Idle Compute</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Simulates an active EC2 instance with low CPU load.</p>
            {isRunning === 'idle_resource' && <Play className="w-4 h-4 text-yellow-650 absolute bottom-4 right-4 animate-pulse" />}
          </motion.button>

          {/* Evaluate Sentinel */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => triggerScenario('sentinel_run', 'Evaluate Sentinel')}
            disabled={isRunning !== null}
            className={`sm:col-span-2 relative group flex flex-row items-center p-4 rounded-xl border text-left transition-all ${
              isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-950/20'
            } border-indigo-500/40 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/10 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/20`}
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mr-4"><ShieldCheck className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="flex w-full justify-between items-center mb-1">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Evaluate Sentinel Engine</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 uppercase">SENTINEL</span>
              </div>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/85">Manually triggers the classification rules engine to detect active leaks immediately.</p>
            </div>
            {isRunning === 'sentinel_run' && <Play className="w-4 h-4 text-indigo-655 absolute right-4 animate-pulse" />}
          </motion.button>

        </div>
      </div>

      {/* Terminal Emulator */}
      <div className="flex flex-col rounded-2xl border bg-white/95 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-slate-950/50 overflow-hidden transition-all duration-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-350 hover:bg-white dark:hover:bg-slate-900/95">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Execution Console</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2 w-2`}>
                {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-cyan-600' : 'bg-slate-400 dark:bg-slate-600'}`}></span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-450">{isRunning ? 'EXECUTING' : 'IDLE'}</span>
            </div>
            <button onClick={clearLogs} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Clear Console">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={scrollRef}
          className="flex-1 p-4 font-mono text-xs text-slate-750 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/80 overflow-y-auto h-[300px] max-h-[300px] leading-relaxed border-t border-slate-100 dark:border-slate-900 flex flex-col justify-start items-start"
        >
          {logs.length === 0 ? (
            <div className="w-full flex flex-col justify-start items-start opacity-70">
              <span className="flex items-center gap-1">
                <span>&gt; System initialized. Waiting for scenario trigger...</span>
                <span className="animate-pulse select-none">_</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 w-full justify-start items-start">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-slate-400 dark:text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className="break-words">{formatLogMessage(log.message)}</span>
                </div>
              ))}
              {isRunning && (
                <div className="flex gap-2 mt-1 animate-pulse">
                  <span className="text-slate-400 dark:text-slate-500 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className="text-cyan-600 dark:text-cyan-400">&gt; _</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
