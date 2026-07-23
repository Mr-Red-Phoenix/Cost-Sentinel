import time
import argparse
import schedule
import requests
import logging

# OpenTelemetry Logging Imports
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import SimpleLogRecordProcessor
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.sdk.resources import Resource

# ANSI colors for terminal
class Colors:
    HEADER = '\033[95m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


class DataFetcher:
    """Queries SigNoz for the latest telemetry data."""
    def __init__(self, prometheus_url="http://localhost:3301/api/v1/query"):
        self.prometheus_url = prometheus_url

    def _query(self, query: str):
        """Helper to run a PromQL query against SigNoz."""
        try:
            resp = requests.get(self.prometheus_url, params={"query": query}, timeout=3)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("data", {}).get("result", [])
                if results:
                    # Prometheus returns [timestamp, "value"]
                    return float(results[0].get("value", [0, "0"])[1])
        except Exception as e:
            # Silently fail for simplicity in demo
            pass
        return None

    def fetch_metrics(self):
        """Fetches the latest metrics for evaluation."""
        # SigNoz appends _total to Counter metrics when converting OTLP to Prometheus format
        nat_bytes = self._query('aws_nat_bytes_processed_total') or self._query('aws_nat_bytes_processed') or 0.0
        vpc_hits = self._query('aws_vpc_endpoint_hits_total') or self._query('aws_vpc_endpoint_hits') or 0.0
        
        # CPU is a gauge
        cpu_util = self._query('aws_ec2_cpu_utilization')
        
        # AI Tokens (fallback to 0 if not present since we use trace-based generation primarily)
        ai_tokens = self._query('gen_ai_usage_completion_tokens') or 0.0

        return {
            "nat_bytes": nat_bytes,
            "vpc_hits": vpc_hits,
            "cpu_util": cpu_util,
            "ai_tokens": ai_tokens,
            "dummy_cost_spike": False # Used to simulate glitch rule
        }


class RuleEvaluator:
    """Evaluates business logic rules against fetched data."""
    def evaluate_all(self, data):
        leaks = []
        # 1. Infra Leak: Missing VPC Endpoint
        if data["nat_bytes"] > 1000 and data["vpc_hits"] == 0:
            leaks.append({
                "type": "real leak: missing VPC endpoint",
                "severity": "CRITICAL",
                "recommendation": "Provision AWS VPC Endpoint to bypass NAT Gateway data egress billing."
            })
            
        # 2. Idle Resource: Wasting compute
        if data["cpu_util"] is not None and data["cpu_util"] < 5.0:
            leaks.append({
                "type": "real leak: idle resource",
                "severity": "MEDIUM",
                "recommendation": "Terminate or downsize EC2 instance (CPU utilization < 5%)."
            })
            
        # 3. AI Leak: Agent Loop / Retry Storm
        if data["ai_tokens"] > 1000:
            leaks.append({
                "type": "real leak: agent loop / retry storm",
                "severity": "HIGH",
                "recommendation": "Enforce max_iterations limit on ReAct agent loop context."
            })
            
        # 4. Glitch: Cost spike without underlying activity
        if data.get("dummy_cost_spike") and data["nat_bytes"] == 0 and data["ai_tokens"] == 0:
            leaks.append({
                "type": "measurement glitch — no action needed",
                "severity": "INFO",
                "recommendation": "No action needed."
            })
            
        return leaks


class SignozWriter:
    """Writes alert logs back to SigNoz via OTLP."""
    def __init__(self, otlp_endpoint="http://localhost:4318/v1/logs"):
        # Setup OTel Logger Provider
        resource = Resource.create({"service.name": "cost-sentinel-classifier"})
        self.logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(self.logger_provider)
        
        # Setup Exporter (using Simple processor for immediate dispatch in run-once mode)
        exporter = OTLPLogExporter(endpoint=otlp_endpoint)
        self.logger_provider.add_log_record_processor(SimpleLogRecordProcessor(exporter))
        
        # Attach OTel Handler to standard Python logging
        self.logger = logging.getLogger("cost-sentinel")
        self.logger.setLevel(logging.WARN)
        handler = LoggingHandler(level=logging.WARN, logger_provider=self.logger_provider)
        self.logger.addHandler(handler)

    def emit_alert(self, leak: dict):
        label = leak["type"]
        severity = leak["severity"]
        recommendation = leak["recommendation"]
        
        # Print to console for immediate demo feedback
        print(f"{Colors.FAIL}[ALERT] [{severity}] {label}{Colors.ENDC}")
        print(f"        {Colors.OKCYAN}-> Fix: {recommendation}{Colors.ENDC}")
        
        # Emit to SigNoz as a WARN log with rich metadata
        self.logger.warning(
            f"Cost Anomaly Detected: {label}", 
            extra={
                "sentinel.classification_type": label,
                "sentinel.severity": severity,
                "sentinel.recommendation": recommendation
            }
        )
        
        # Force flush to ensure the log is sent immediately before script exit
        self.logger_provider.force_flush()


def run_evaluation_cycle(simulate=False):
    """Fetches data, evaluates rules, and emits alerts."""
    print(f"{Colors.OKCYAN}Running evaluation cycle...{Colors.ENDC}")
    
    fetcher = DataFetcher()
    evaluator = RuleEvaluator()
    writer = SignozWriter()
    
    data = fetcher.fetch_metrics()
    
    if simulate or (data["nat_bytes"] == 0 and data["ai_tokens"] == 0):
        print(f"  {Colors.WARNING}[SIMULATION] Injecting multi-leak metrics for dry-run evaluation...{Colors.ENDC}")
        data = {
            "nat_bytes": 105000000.0,
            "vpc_hits": 0.0,
            "cpu_util": 3.5,
            "ai_tokens": 5500.0,
            "dummy_cost_spike": False
        }
        
    print(f"  {Colors.BOLD}Fetched Metrics:{Colors.ENDC} {data}")
    
    leaks = evaluator.evaluate_all(data)
    
    if leaks:
        for leak in leaks:
            writer.emit_alert(leak)
    else:
        print(f"  {Colors.OKGREEN}[OK] No anomalies detected.{Colors.ENDC}")


def main():
    parser = argparse.ArgumentParser(description="Cost Sentinel - Classification Engine")
    parser.add_argument("--run-once", action="store_true", 
                        help="Run the evaluation cycle once and exit.")
    parser.add_argument("--interval", type=int, default=60, 
                        help="Interval in seconds for the scheduled loop (default: 60)")
    parser.add_argument("--simulate", action="store_true",
                        help="Force simulate leak detection during dry-run testing")
    
    args = parser.parse_args()
    
    if args.run_once:
        run_evaluation_cycle(simulate=args.simulate)
        return
        
    print(f"{Colors.HEADER}=== Cost Sentinel Engine Started (Interval: {args.interval}s) ==={Colors.ENDC}")
    schedule.every(args.interval).seconds.do(lambda: run_evaluation_cycle(simulate=args.simulate))
    
    # Run immediately on startup
    run_evaluation_cycle(simulate=args.simulate)
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Shutting down Sentinel engine.{Colors.ENDC}")


if __name__ == "__main__":
    main()
