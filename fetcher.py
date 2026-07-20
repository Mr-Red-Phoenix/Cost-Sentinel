import requests
import logging
from config import SIGNOZ_API_URL, SIGNOZ_API_KEY

logger = logging.getLogger(__name__)

class DataFetcher:
    """
    Fetches metrics from SigNoz API.
    """
    def __init__(self):
        # Querying the prometheus API of SigNoz.
        self.query_url = f"{SIGNOZ_API_URL}/query"

    def fetch_ai_metrics(self):
        """
        Fetches AI token usage and request counts.
        """
        logger.info("Fetching AI metrics from SigNoz...")
        # Example PromQL query for token usage and request count
        token_query = "sum(rate(gen_ai_usage_total_tokens[5m]))"
        request_query = "sum(rate(gen_ai_requests_total[5m]))"
        
        token_usage = self._execute_query(token_query)
        request_count = self._execute_query(request_query)
        
        return {
            "token_usage": token_usage,
            "request_count": request_count
        }
        
    def fetch_infra_metrics(self):
        """
        Fetches Infra metrics (NAT Gateway / CPU, VPC endpoints).
        """
        logger.info("Fetching Infra metrics from SigNoz...")
        nat_traffic_query = "sum(rate(aws_nat_gateway_bytes_out[5m]))"
        vpc_endpoints_query = "sum(rate(aws_vpc_endpoint_hits[5m]))"
        
        nat_traffic = self._execute_query(nat_traffic_query)
        vpc_hits = self._execute_query(vpc_endpoints_query)
        
        return {
            "nat_traffic": nat_traffic,
            "vpc_endpoint_hits": vpc_hits
        }

    def _execute_query(self, query):
        headers = {}
        if SIGNOZ_API_KEY:
            headers["SIGNOZ-API-KEY"] = SIGNOZ_API_KEY
            
        try:
            response = requests.get(self.query_url, params={"query": query}, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and data['data']['result']:
                    return float(data['data']['result'][0]['value'][1])
            else:
                logger.error(f"Query failed with status code {response.status_code}: {response.text}")
            return 0.0
        except Exception as e:
            logger.error(f"Error executing query {query}: {e}")
            return 0.0
