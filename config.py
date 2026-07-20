import os

SIGNOZ_API_URL = os.getenv("SIGNOZ_API_URL", "http://localhost:3301/api/v1")
SIGNOZ_API_KEY = os.getenv("SIGNOZ_API_KEY", "")
OTLP_ENDPOINT = os.getenv("OTLP_ENDPOINT", "http://localhost:4318")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "10")) # 10 seconds for easier testing
