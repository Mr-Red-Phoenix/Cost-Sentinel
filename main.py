import time
import schedule
import logging
from config import CHECK_INTERVAL
from fetcher import DataFetcher
from evaluator import RuleEvaluator
from writer import SignozWriter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def run_sentinel():
    logger.info("Cost Sentinel run starting...")
    
    fetcher = DataFetcher()
    # Lower baseline to 100 tokens and infra to 1000 for easier local testing
    evaluator = RuleEvaluator(ai_token_baseline=100, infra_nat_threshold=1000)
    writer = SignozWriter()
    
    # 1. Fetch
    ai_metrics = fetcher.fetch_ai_metrics()
    infra_metrics = fetcher.fetch_infra_metrics()
    
    # Log fetched values
    logger.info(f"Fetched AI metrics: token_usage={ai_metrics.get('token_usage')}, request_count={ai_metrics.get('request_count')}")
    logger.info(f"Fetched Infra metrics: nat_traffic={infra_metrics.get('nat_traffic')}, vpc_endpoint_hits={infra_metrics.get('vpc_endpoint_hits')}")
    
    # 2. Evaluate
    alerts = evaluator.evaluate(ai_metrics, infra_metrics)
    
    # 3. Write
    if not alerts:
        logger.info("No cost leaks detected in this window.")
    else:
        for alert in alerts:
            writer.write_alert(alert)
            
    logger.info("Cost Sentinel run complete.")

def main():
    logger.info("Starting Cost Sentinel Service...")
    
    # Run once immediately
    run_sentinel()
    
    # Schedule periodic execution
    schedule.every(CHECK_INTERVAL).seconds.do(run_sentinel)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
