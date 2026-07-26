import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const SIGNOZ_URL = process.env.SIGNOZ_API_URL || 'http://localhost:18080/api/v1/query';
const SIGNOZ_KEY = process.env.SIGNOZ_API_KEY || '8isHFUpGGkZA88pKL8rLsYt0r6VIikGKDM4004Grg3g=';

export async function GET() {
  let natBytes = 0;
  let vpcHits = 0;
  let cpuUtil = 45.0;
  let aiTokens = 0;
  let requestsCount = 0;
  let isSimulated = false;

  // Read active scenario from local file
  let activeScenario = 'normal';
  try {
    const activeScenarioPath = path.resolve(process.cwd(), 'active_scenario.json');
    if (fs.existsSync(activeScenarioPath)) {
      const activeData = JSON.parse(fs.readFileSync(activeScenarioPath, 'utf8'));
      activeScenario = activeData.scenario || 'normal';
    }
  } catch (e) {
    console.error('Failed to read active_scenario.json, defaulting to normal:', e);
  }

  try {
    // 1. Fetch AI Tokens metric
    const aiRes = await fetch(`${SIGNOZ_URL}?query=sum(rate(gen_ai_usage_total_tokens[5m]))`, {
      headers: { 'SIGNOZ-API-KEY': SIGNOZ_KEY },
      next: { revalidate: 0 },
    });
    if (aiRes.ok) {
      const data = await aiRes.json();
      const val = data?.data?.result?.[0]?.value?.[1];
      if (val) aiTokens = parseFloat(val);
    }

    // 2. Fetch NAT Bytes
    const natRes = await fetch(`${SIGNOZ_URL}?query=sum(rate(aws_nat_bytes_processed_total[5m]))`, {
      headers: { 'SIGNOZ-API-KEY': SIGNOZ_KEY },
      next: { revalidate: 0 },
    });
    if (natRes.ok) {
      const data = await natRes.json();
      const val = data?.data?.result?.[0]?.value?.[1];
      if (val) natBytes = parseFloat(val);
    }

    // 3. Fetch VPC Hits
    const vpcRes = await fetch(`${SIGNOZ_URL}?query=sum(rate(aws_vpc_endpoint_hits_total[5m]))`, {
      headers: { 'SIGNOZ-API-KEY': SIGNOZ_KEY },
      next: { revalidate: 0 },
    });
    if (vpcRes.ok) {
      const data = await vpcRes.json();
      const val = data?.data?.result?.[0]?.value?.[1];
      if (val) vpcHits = parseFloat(val);
    }

    // 4. Fetch CPU Util
    const cpuRes = await fetch(`${SIGNOZ_URL}?query=avg(aws_ec2_cpu_utilization)`, {
      headers: { 'SIGNOZ-API-KEY': SIGNOZ_KEY },
      next: { revalidate: 0 },
    });
    if (cpuRes.ok) {
      const data = await cpuRes.json();
      const val = data?.data?.result?.[0]?.value?.[1];
      if (val) cpuUtil = parseFloat(val);
    }
  } catch (e) {
    // Graceful fallback to rich simulated metrics if offline
    isSimulated = true;
  }

  // If no live telemetry detected, present live simulated active scenario payload for demonstration
  if (natBytes === 0 && aiTokens === 0 && vpcHits === 0) {
    isSimulated = true;
    
    if (activeScenario === 'infra_leak') {
      natBytes = 105400000; // ~105 MB unrouted
      vpcHits = 0;
      cpuUtil = 48.0;
      aiTokens = 0;
      requestsCount = 0;
    } else if (activeScenario === 'agent_loop') {
      natBytes = 0;
      vpcHits = 0;
      cpuUtil = 42.0;
      aiTokens = 5420; // High token surge
      requestsCount = 2; // Low request count -> AI loop!
    } else if (activeScenario === 'glitch') {
      natBytes = 0;
      vpcHits = 0;
      cpuUtil = 38.0;
      aiTokens = 8500;
      requestsCount = 1;
    } else if (activeScenario === 'idle_resource') {
      natBytes = 0;
      vpcHits = 0;
      cpuUtil = 3.2; // Idle EC2
      aiTokens = 0;
      requestsCount = 0;
    } else {
      // 'normal' or empty
      natBytes = 1200000; // ~1.2 MB healthy NAT
      vpcHits = 45;
      cpuUtil = 48.0; // Normal load
      aiTokens = 800; // Normal token usage
      requestsCount = 10;
    }
  }

  // Evaluate Sentinel Multi-Category Rules Engine
  const anomalies = [];

  // Rule 1: Un-routed Infra Egress (CRITICAL)
  if (natBytes > 1000 && vpcHits === 0) {
    anomalies.push({
      id: 'leak-vpc-1',
      category: 'Real Infra Leak (VPC)',
      severity: 'CRITICAL',
      title: 'Un-routed Infrastructure Egress via NAT Gateway',
      description: `Detected ${formatBytes(natBytes)} passing through AWS NAT Gateway with 0 VPC Endpoint hits. Traffic is unnecessarily incurring data egress charges.`,
      recommendation: 'Provision AWS VPC Endpoint for S3/DynamoDB to bypass NAT Gateway data egress fees.',
      metrics: { natBytes, vpcHits },
      codeSnippet: `# AWS CLI Remediation: Provision Direct VPC Endpoint\naws ec2 create-vpc-endpoint \\\n  --vpc-id vpc-0a1b2c3d4e5f \\\n  --service-name com.amazonaws.us-east-1.s3 \\\n  --route-table-ids rtb-0123456789abcdef0`,
      timestamp: new Date().toISOString(),
    });
  }

  // Rule 2: Idle Compute Resource (MEDIUM)
  if (cpuUtil < 5.0) {
    anomalies.push({
      id: 'leak-idle-1',
      category: 'Real Infra Leak (Idle)',
      severity: 'MEDIUM',
      title: 'Underutilized Compute Instance Billed Idle',
      description: `EC2 instance running at ${cpuUtil.toFixed(1)}% CPU load while actively accruing hourly billing charges.`,
      recommendation: 'Downsize or terminate underutilized EC2 compute instance.',
      metrics: { cpuUtil },
      codeSnippet: `# Terraform Remediation: Enable Auto-Stop or Downsize Instance\nresource "aws_instance" "app_worker" {\n  instance_type = "t3.micro" # Downsized from t3.xlarge\n  cpu_credits   = "standard"\n}`,
      timestamp: new Date().toISOString(),
    });
  }

  // Rule 3: AI Agent Infinite Loop / Retry Storm (HIGH)
  if (aiTokens > 1000 && (requestsCount === 0 || aiTokens / Math.max(requestsCount, 1) > 1000)) {
    anomalies.push({
      id: 'leak-ai-1',
      category: 'Real AI Leak (Agent Loop)',
      severity: 'HIGH',
      title: 'AI Agent Infinite Loop / Context Stuffing',
      description: `ReAct agent consumed ${aiTokens.toLocaleString()} tokens across recursive retry depth without proportional request progress.`,
      recommendation: 'Enforce max_iterations guardrail limit & context truncation on ReAct agent loops.',
      metrics: { aiTokens, requestsCount },
      codeSnippet: `# Python Traceloop / LangChain Guardrail\nagent = initialize_agent(\n    tools=tools,\n    llm=llm,\n    max_iterations=3,        # Prevent infinite retry loops\n    early_stopping_method="generate"\n)`,
      timestamp: new Date().toISOString(),
    });
  }

  // Calculate system status
  const hasCritical = anomalies.some(a => a.severity === 'CRITICAL');
  const hasHigh = anomalies.some(a => a.severity === 'HIGH');
  const status = hasCritical ? 'CRITICAL_LEAK' : hasHigh ? 'HIGH_LEAK' : anomalies.length > 0 ? 'WARNING' : 'HEALTHY';

  return NextResponse.json({
    status,
    isSimulated,
    timestamp: new Date().toISOString(),
    summary: {
      totalAnomalies: anomalies.length,
      criticalCount: anomalies.filter(a => a.severity === 'CRITICAL').length,
      highCount: anomalies.filter(a => a.severity === 'HIGH').length,
      mediumCount: anomalies.filter(a => a.severity === 'MEDIUM').length,
      infoCount: anomalies.filter(a => a.severity === 'INFO').length,
      totalTokens: aiTokens,
      natBytesProcessed: natBytes,
      vpcEndpointHits: vpcHits,
      avgCpuUtil: cpuUtil,
      estimatedHourlyLeakCost: calculateHourlyLeakCost(natBytes, aiTokens, cpuUtil),
    },
    anomalies,
  });
}

function formatBytes(bytes: number) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} B`;
}

function calculateHourlyLeakCost(natBytes: number, tokens: number, cpu: number) {
  // AWS NAT egress: ~$0.045 / GB
  const natCost = (natBytes / 1e9) * 0.045;
  // LLM tokens: ~$0.005 / 1k tokens
  const tokenCost = (tokens / 1000) * 0.005;
  // Idle EC2 t3.xlarge waste: ~$0.1664 / hr when < 5% CPU
  const idleCost = cpu < 5.0 ? 0.1664 : 0.0;
  return (natCost + tokenCost + idleCost).toFixed(4);
}
