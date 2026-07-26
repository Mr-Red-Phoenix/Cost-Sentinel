import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types/sentinel';

// Default empty state to prevent crashes
const defaultData: DashboardData = {
  status: 'HEALTHY',
  isSimulated: false,
  timestamp: new Date().toISOString(),
  summary: {
    totalAnomalies: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    infoCount: 0,
    totalTokens: 0,
    natBytesProcessed: 0,
    vpcEndpointHits: 0,
    avgCpuUtil: 0,
    estimatedHourlyLeakCost: '0.0000',
  },
  anomalies: [],
  telemetryHistory: [],
};

interface TriggerScenarioOptions {
  count?: number;
  duration?: number;
}

export function useSentinelData() {
  const [data, setData] = useState<DashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    
    try {
      setError(null);
      const res = await fetch('/api/anomalies');
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
      const json = await res.json();
      
      // Merge with defaultData to ensure all fields like telemetryHistory exist safely
      setData(prev => ({
        ...defaultData,
        ...json,
        // Ensure telemetryHistory is present as backend may not provide it yet
        telemetryHistory: json.telemetryHistory || prev.telemetryHistory || [],
      }));
    } catch (err: any) {
      console.error('Failed to fetch anomalies:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  // Auto-polling effect
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(false); // background poll, not manual refresh
    }, 5000); // 5s polling
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const triggerScenario = async (scenario: string, options?: TriggerScenarioOptions) => {
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario,
          count: options?.count,
          duration: options?.duration,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`Scenario failed: ${res.statusText}`);
      }
      
      // Refresh data immediately after triggering a scenario
      await fetchDashboardData(true);
      return await res.json();
    } catch (err: any) {
      console.error(`Failed to trigger scenario ${scenario}:`, err);
      throw err;
    }
  };

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchDashboardData(true),
    triggerScenario,
  };
}
