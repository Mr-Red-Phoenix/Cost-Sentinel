import time
import logging
from config import OTLP_ENDPOINT

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def setup_metrics():
    """
    Sets up OpenTelemetry metrics exporting to SigNoz OTLP HTTP receiver.
    """
    # SigNoz receives OTLP metrics at /v1/metrics for HTTP
    otlp_endpoint = f"{OTLP_ENDPOINT}/v1/metrics"
    
    resource = Resource.create({"service.name": "mock-ai-service"})
    
    exporter = OTLPMetricExporter(endpoint=otlp_endpoint)
    # Using periodic exporter to batch send
    reader = PeriodicExportingMetricReader(exporter, export_interval_millis=1000)
    
    provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(provider)
    
    return metrics.get_meter("mock_data_generator")

def simulate_ai_leak():
    """
    Simulates an AI Token Leak (high tokens, low requests).
    """
    meter = setup_metrics()
    
    # Create counters for our metrics
    token_counter = meter.create_counter(
        "gen_ai_usage_total_tokens",
        description="Total tokens used by GenAI",
    )
    request_counter = meter.create_counter(
        "gen_ai_requests_total",
        description="Total requests made to GenAI",
    )
    
    logger.info("Starting mock data generation for 'Real AI Leak'...")
    logger.info(f"Sending OTLP metrics to {OTLP_ENDPOINT}/v1/metrics")
    
    try:
        while True:
            # Simulate high token burst
            tokens = 5000
            # Simulate only 1 request
            requests = 1 
            
            token_counter.add(tokens, {"model": "gpt-4"})
            request_counter.add(requests, {"model": "gpt-4"})
            
            logger.info(f"Pushed mock metrics: Tokens={tokens}, Requests={requests}")
            time.sleep(5)
    except KeyboardInterrupt:
        logger.info("Mock data generation stopped.")

if __name__ == "__main__":
    simulate_ai_leak()
