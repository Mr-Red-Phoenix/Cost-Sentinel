export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type Status = 'HEALTHY' | 'WARNING' | 'HIGH_LEAK' | 'CRITICAL_LEAK';

export interface Anomaly {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  codeSnippet: string;
  timestamp: string;
  metrics?: Record<string, number>;
  traceId?: string;
  traceUrl?: string;
}

export interface DashboardSummary {
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  infoCount?: number;
  totalTokens: number;
  natBytesProcessed: number;
  vpcEndpointHits: number;
  avgCpuUtil: number;
  estimatedHourlyLeakCost: string;
}

export interface TelemetryPoint {
  timestamp: string;
  tokens: number;
  natEgressMb: number;
  vpcHits: number;
  cpuLoad: number;
}

export interface DashboardData {
  status: Status;
  isSimulated: boolean;
  timestamp: string;
  summary: DashboardSummary;
  anomalies: Anomaly[];
  telemetryHistory: TelemetryPoint[];
}
