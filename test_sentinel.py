import logging
from fetcher import DataFetcher
from evaluator import RuleEvaluator
from writer import SignozWriter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

class MockDataFetcher(DataFetcher):
    """
    A subclass of DataFetcher that returns simulated metrics instead of making real API calls,
    allowing us to test the sentinel logic instantly without running SigNoz.
    """
    def __init__(self, token_usage=0.0, request_count=0.0, nat_traffic=0.0, vpc_hits=0.0):
        super().__init__()
        self.mocked_token_usage = token_usage
        self.mocked_request_count = request_count
        self.mocked_nat_traffic = nat_traffic
        self.mocked_vpc_hits = vpc_hits

    def fetch_ai_metrics(self):
        logger.info(f"[Mock] Fetching AI Metrics: Tokens={self.mocked_token_usage}, Requests={self.mocked_request_count}")
        return {
            "token_usage": self.mocked_token_usage,
            "request_count": self.mocked_request_count
        }

    def fetch_infra_metrics(self):
        logger.info(f"[Mock] Fetching Infra Metrics: NAT Traffic={self.mocked_nat_traffic}, VPC Hits={self.mocked_vpc_hits}")
        return {
            "nat_traffic": self.mocked_nat_traffic,
            "vpc_endpoint_hits": self.mocked_vpc_hits
        }


def run_dry_run_test():
    logger.info("=== STARTING COST SENTINEL DRY-RUN TEST ===")
    
    # Let's test the "Real AI Leak" scenario
    # Baseline is 1000. Let's send 5000 tokens but only 1 request (classic leak loop).
    logger.info("\n--- Scenario 1: Simulating 'Real AI Leak' ---")
    mock_fetcher_ai = MockDataFetcher(token_usage=5000.0, request_count=1.0)
    evaluator = RuleEvaluator(ai_token_baseline=1000, infra_nat_threshold=5000)
    
    ai_metrics = mock_fetcher_ai.fetch_ai_metrics()
    infra_metrics = mock_fetcher_ai.fetch_infra_metrics()
    
    alerts = evaluator.evaluate(ai_metrics, infra_metrics)
    for alert in alerts:
        logger.info(f"SUCCESS: Rule Evaluator caught: {alert['type']} - {alert['description']}")

    # Let's test the "Real Infra Leak" scenario
    # Threshold is 5000. Let's send 8000 NAT Traffic but 0 VPC Endpoint Hits.
    logger.info("\n--- Scenario 2: Simulating 'Real Infra Leak' ---")
    mock_fetcher_infra = MockDataFetcher(nat_traffic=8000.0, vpc_hits=0.0)
    
    ai_metrics = mock_fetcher_infra.fetch_ai_metrics()
    infra_metrics = mock_fetcher_infra.fetch_infra_metrics()
    
    alerts = evaluator.evaluate(ai_metrics, infra_metrics)
    for alert in alerts:
        logger.info(f"SUCCESS: Rule Evaluator caught: {alert['type']} - {alert['description']}")

    # Scenario 3: Healthy behaviour
    logger.info("\n--- Scenario 3: Simulating Legitimate Behavior ---")
    mock_fetcher_healthy = MockDataFetcher(token_usage=800.0, request_count=10.0, nat_traffic=2000.0, vpc_hits=50.0)
    
    ai_metrics = mock_fetcher_healthy.fetch_ai_metrics()
    infra_metrics = mock_fetcher_healthy.fetch_infra_metrics()
    
    alerts = evaluator.evaluate(ai_metrics, infra_metrics)
    if not alerts:
        logger.info("SUCCESS: No alerts triggered for healthy traffic.")

    logger.info("\n=== DRY-RUN TEST COMPLETE ===")

if __name__ == "__main__":
    run_dry_run_test()
