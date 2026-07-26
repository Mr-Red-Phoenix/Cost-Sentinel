import os
import requests
import logging
from config import SIGNOZ_API_URL, SIGNOZ_API_KEY, SLACK_WEBHOOK_URL

logger = logging.getLogger(__name__)

class SignozWriter:
    """
    Posts annotations/events to the SigNoz Dashboard and dispatches webhook notifications.
    """
    def __init__(self):
        self.annotations_url = f"{SIGNOZ_API_URL}/annotations"
        self.slack_webhook_url = os.getenv("SLACK_WEBHOOK_URL", SLACK_WEBHOOK_URL)

    def write_alert(self, alert):
        """
        Pushes an annotation to SigNoz and sends Slack webhook if configured.
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

        # Send Slack Webhook Notification if SLACK_WEBHOOK_URL is configured
        if self.slack_webhook_url:
            slack_payload = {
                "text": f"🚨 *Cost Sentinel Alert* [{alert.get('severity', 'HIGH')}]\n*Type*: {alert['type']}\n*Details*: {alert['description']}\n*Dashboard*: http://localhost:8080"
            }
            try:
                requests.post(self.slack_webhook_url, json=slack_payload, timeout=3)
                logger.info("Successfully sent Slack alert notification.")
            except Exception as e:
                logger.error(f"Failed to send Slack notification: {e}")
