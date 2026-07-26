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
        
        token_usage = ai_metrics.get("token_usage", 0)
        req_count = ai_metrics.get("request_count", 0)
        nat_traffic = infra_metrics.get("nat_traffic", 0)
        vpc_hits = infra_metrics.get("vpc_endpoint_hits", 0)

        # Rule 0: Legitimate Growth (Token growth scales proportionally with request volume)
        if req_count > 0 and token_usage > self.ai_token_baseline:
            if (token_usage / req_count) <= 800:
                logger.info("Rule Match: Legitimate Growth Detected!")
                alerts.append({
                    "type": "Legitimate Growth",
                    "severity": "INFO",
                    "description": f"Token usage ({token_usage}) scaled proportionally with request volume ({req_count} requests). No action needed."
                })
                return alerts

        # Rule 1: Real AI Leak
        if token_usage > self.ai_token_baseline and (req_count == 0 or (token_usage / req_count) > 800):
            logger.warning("Rule Match: Real AI Leak Detected!")
            alerts.append({
                "type": "Real AI Leak",
                "severity": "HIGH",
                "description": f"Token usage ({token_usage}) exceeded baseline without proportional request growth."
            })
            
        # Rule 2: Real Infra Leak
        if nat_traffic > self.infra_nat_threshold and vpc_hits == 0:
            logger.warning("Rule Match: Real Infra Leak Detected!")
            alerts.append({
                "type": "Real Infra Leak",
                "severity": "CRITICAL",
                "description": f"High NAT traffic ({nat_traffic}) observed with 0 VPC endpoint hits."
            })
            
        # Agent Sentinel: RAG & LLM Decision Quality Rules (2x2 Matrix)
        relevancy = ai_metrics.get("context_relevancy", 1.0)
        faithfulness = ai_metrics.get("faithfulness", 1.0)

        if relevancy < 0.5 and faithfulness < 0.5:
            logger.warning("Rule Match: Compounding RAG Failure!")
            alerts.append({
                "type": "Compounding RAG Failure",
                "severity": "CRITICAL",
                "description": f"Both Context Relevancy ({relevancy:.2f}) and Faithfulness ({faithfulness:.2f}) failed. Total breakdown."
            })
        elif relevancy < 0.5:
            logger.warning("Rule Match: Bad Retrieval (Hallucination Risk)!")
            alerts.append({
                "type": "Bad Retrieval (Hallucination Risk)",
                "severity": "HIGH",
                "description": f"Low Context Relevancy ({relevancy:.2f}). Vector retriever returned irrelevant document chunks."
            })
        elif faithfulness < 0.5:
            logger.warning("Rule Match: Bad Agent Decision!")
            alerts.append({
                "type": "Bad Agent Decision",
                "severity": "HIGH",
                "description": f"Low Faithfulness ({faithfulness:.2f}). Agent retrieved relevant context but generated an ungrounded hallucinated decision."
            })

        return alerts
