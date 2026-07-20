import logging

logger = logging.getLogger(__name__)

class RuleEvaluator:
    """
    Evaluates business rules against metrics to classify cost spikes.
    """
    def __init__(self, ai_token_baseline, infra_nat_threshold):
        self.ai_token_baseline = ai_token_baseline
        self.infra_nat_threshold = infra_nat_threshold

    def evaluate(self, ai_metrics, infra_metrics):
        """
        Evaluates metrics and returns a list of detected alerts.
        """
        alerts = []
        
        # Rule 1: Real AI Leak
        # If Token usage > Baseline AND Request count stable
        # For simplicity, assuming "stable" means request_count > 0 and token usage is disproportionately high
        token_usage = ai_metrics.get("token_usage", 0)
        req_count = ai_metrics.get("request_count", 0)
        
        # Simple heuristic: high tokens, but low/moderate requests
        if token_usage > self.ai_token_baseline and req_count < (token_usage / 100):
            logger.warning("Rule Match: Real AI Leak Detected!")
            alerts.append({
                "type": "Real AI Leak",
                "description": f"Token usage ({token_usage}) exceeded baseline without proportional request growth."
            })
            
        # Rule 2: Real Infra Leak
        # If NAT traffic > Threshold AND VPC Endpoint hits == 0
        nat_traffic = infra_metrics.get("nat_traffic", 0)
        vpc_hits = infra_metrics.get("vpc_endpoint_hits", 0)
        
        if nat_traffic > self.infra_nat_threshold and vpc_hits == 0:
            logger.warning("Rule Match: Real Infra Leak Detected!")
            alerts.append({
                "type": "Real Infra Leak",
                "description": f"High NAT traffic ({nat_traffic}) observed with 0 VPC endpoint hits."
            })
            
        return alerts
