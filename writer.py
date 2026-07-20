import requests
import logging
from config import SIGNOZ_API_URL, SIGNOZ_API_KEY

logger = logging.getLogger(__name__)

class SignozWriter:
    """
    Posts annotations/events to the SigNoz Dashboard.
    """
    def __init__(self):
        # Using a generic events/annotations API route.
        self.annotations_url = f"{SIGNOZ_API_URL}/annotations"

    def write_alert(self, alert):
        """
        Pushes an annotation to SigNoz to appear on graphs.
        """
        logger.info(f"Writing alert to SigNoz: {alert['type']}")
        
        payload = {
            "title": alert["type"],
            "description": alert["description"],
            "tags": ["cost-sentinel", "cost-leak", alert["type"].lower().replace(" ", "-")],
        }
        
        headers = {}
        if SIGNOZ_API_KEY:
            headers["SIGNOZ-API-KEY"] = SIGNOZ_API_KEY
            
        try:
            response = requests.post(self.annotations_url, json=payload, headers=headers, timeout=5)
            if response.status_code in [200, 201]:
                logger.info("Successfully added annotation to SigNoz.")
            else:
                logger.error(f"Failed to add annotation: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Exception while writing to SigNoz API: {e}")
