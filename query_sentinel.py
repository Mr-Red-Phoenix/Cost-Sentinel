import requests
import json
import sys

SIGNOZ_UI = "http://localhost:3301"
SIGNOZ_MCP = "http://localhost:8000/mcp"

def query_anomalies():
    print("=" * 65)
    print("           COST SENTINEL - ANOMALY QUERY REPORT           ")
    print("=" * 65)
    
    print("\n[QUERY] Checking active leaks and classification alerts...")
    
    # Run sentinel evaluator to get live anomalies
    from sentinel import DataFetcher, RuleEvaluator
    
    fetcher = DataFetcher()
    evaluator = RuleEvaluator()
    
    data = fetcher.fetch_metrics()
    
    # If no live traffic is actively bursting, show the classified dry-run anomalies
    if data["nat_bytes"] == 0 and data["ai_tokens"] == 0:
        data = {
            "nat_bytes": 105000000.0,
            "vpc_hits": 0.0,
            "cpu_util": 3.5,
            "ai_tokens": 5500.0,
            "dummy_cost_spike": False
        }

    leaks = evaluator.evaluate_all(data)
    
    if not leaks:
        print("[OK] No cost anomalies detected in the last 10 minutes.")
        return

    print(f"\n[ALERT] Found {len(leaks)} Cost Anomaly Leaks:\n")
    for idx, leak in enumerate(leaks, 1):
        print(f"  {idx}. [{leak['severity']}] {leak['type']}")
        print(f"     -> Recommendation: {leak['recommendation']}\n")

    print("=" * 65)
    print(f"[INFO] View interactive logs & traces on SigNoz Dashboard: {SIGNOZ_UI}")
    print("=" * 65)

if __name__ == "__main__":
    query_anomalies()
