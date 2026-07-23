import time
import argparse
import random
import threading
from typing import Iterable

from opentelemetry import metrics
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.metrics import CallbackOptions, Observation

# Global variable to hold CPU utilization for the ObservableGauge
current_cpu_utilization = 0.0
current_cpu_attributes = {"instance_id": "i-1234567890abcdef0", "status": "billed"}

def cpu_callback(options: CallbackOptions) -> Iterable[Observation]:
    """Callback for the CPU ObservableGauge to report the current CPU value."""
    yield Observation(current_cpu_utilization, current_cpu_attributes)

def setup_otel_metrics():
    """Sets up the OTLP HTTP Metric Exporter and MeterProvider."""
    # Define the resource with the requested service name
    resource = Resource(attributes={"service.name": "cost-sentinel-infra"})
    
    # Configure the OTLP HTTP Exporter pointing to the local SigNoz collector
    exporter = OTLPMetricExporter(endpoint="http://localhost:4318/v1/metrics")
    
    # Configure the reader to export every 5 seconds
    reader = PeriodicExportingMetricReader(exporter, export_interval_millis=5000)
    
    # Set up the MeterProvider
    provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(provider)
    
    # Create the meter
    meter = metrics.get_meter("cost.sentinel.infra")
    
    # Define the 3 custom OTLP metrics
    nat_bytes = meter.create_counter(
        "aws.nat.bytes_processed", 
        unit="bytes", 
        description="Simulates NAT Gateway outbound traffic"
    )
    
    vpc_hits = meter.create_counter(
        "aws.vpc.endpoint_hits", 
        unit="requests", 
        description="Simulates VPC Endpoint traffic"
    )
    
    # CPU is an observable gauge since it represents a point-in-time percentage
    meter.create_observable_gauge(
        "aws.ec2.cpu_utilization",
        callbacks=[cpu_callback],
        unit="percent",
        description="Simulates instance CPU load"
    )
    
    return nat_bytes, vpc_hits, provider

# ANSI colors for terminal logs
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def run_scenario(scenario: str, duration: int, nat_counter, vpc_counter):
    """Runs a specific infrastructure simulation scenario."""
    global current_cpu_utilization
    global current_cpu_attributes
    
    print(f"\n{Colors.HEADER}=== Starting Scenario: {scenario.upper()} for {duration} seconds ==={Colors.ENDC}")
    
    intervals = duration // 5
    if duration % 5 != 0:
        intervals += 1
        
    for i in range(intervals):
        # Scenario logic
        if scenario == "normal":
            # High NAT bytes correlated with HIGH VPC Endpoint hits, healthy CPU (30-60%)
            bytes_to_add = int(random.uniform(45_000_000, 55_000_000)) # ~50MB
            hits_to_add = int(random.uniform(450, 550)) # ~500 hits
            current_cpu_utilization = random.uniform(30.0, 60.0)
            
        elif scenario == "infra_leak":
            # Missing VPC Endpoint: Very high NAT bytes, but 0 VPC Endpoint hits, healthy CPU
            bytes_to_add = int(random.uniform(90_000_000, 110_000_000)) # ~100MB
            hits_to_add = 0 # Leak: no traffic uses the internal endpoint!
            current_cpu_utilization = random.uniform(30.0, 60.0)
            
        elif scenario == "idle_resource":
            # Idle Compute Leak: Normal NAT/VPC, CPU < 3%, active resource status "billed"
            bytes_to_add = int(random.uniform(1_000, 5_000)) # minimal background traffic
            hits_to_add = int(random.uniform(1, 5))
            current_cpu_utilization = random.uniform(0.1, 2.9) # CPU < 3%
            current_cpu_attributes["status"] = "billed"
            
        else:
            print(f"{Colors.WARNING}Unknown scenario: {scenario}{Colors.ENDC}")
            return
            
        # Emit Counters
        nat_counter.add(bytes_to_add, {"gateway_id": "nat-0a1b2c3d4e5f"})
        vpc_counter.add(hits_to_add, {"endpoint_id": "vpce-0123456789abcdef"})
        
        # Log to console
        print(f"{Colors.OKCYAN}[{scenario}]{Colors.ENDC} Interval {i+1}/{intervals}")
        print(f"  {Colors.BOLD}NAT Bytes:{Colors.ENDC} {bytes_to_add:,} bytes")
        print(f"  {Colors.BOLD}VPC Hits:{Colors.ENDC} {hits_to_add} requests")
        print(f"  {Colors.BOLD}CPU Util:{Colors.ENDC} {current_cpu_utilization:.2f}% (Status: {current_cpu_attributes['status']})")
        
        # Sleep for the 5-second interval
        time.sleep(5)
        
    print(f"{Colors.OKGREEN}Scenario {scenario} completed successfully.{Colors.ENDC}")

def run_tests(nat_counter, vpc_counter):
    """Runs a 10-second pulse of each scenario sequentially for self-verification."""
    scenarios = ["normal", "infra_leak", "idle_resource"]
    print(f"{Colors.HEADER}=== Running Automated Self-Test Suite ==={Colors.ENDC}")
    print("This will run a 10-second pulse for each scenario.")
    
    for s in scenarios:
        run_scenario(s, 10, nat_counter, vpc_counter)
        
    print(f"\n{Colors.OKGREEN}All self-tests completed! Check SigNoz Metrics / Dashboards to verify.{Colors.ENDC}")

def main():
    parser = argparse.ArgumentParser(description="Cost Sentinel - Synthetic Infra Metrics Generator")
    parser.add_argument("--scenario", type=str, choices=["normal", "infra_leak", "idle_resource"], 
                        default="normal", help="The scenario to execute.")
    parser.add_argument("--duration", type=int, default=60, 
                        help="Duration in seconds to run the scenario (default: 60s)")
    parser.add_argument("--test", action="store_true", 
                        help="Run the automated self-test across all 3 scenarios")
    
    args = parser.parse_args()
    
    # Initialize OTel Metrics
    nat_counter, vpc_counter, provider = setup_otel_metrics()
    
    try:
        if args.test:
            run_tests(nat_counter, vpc_counter)
        else:
            run_scenario(args.scenario, args.duration, nat_counter, vpc_counter)
    except KeyboardInterrupt:
        print(f"\n{Colors.WARNING}Execution interrupted by user.{Colors.ENDC}")
    finally:
        # Force a flush of any remaining metrics before exiting
        provider.force_flush()

if __name__ == "__main__":
    main()
