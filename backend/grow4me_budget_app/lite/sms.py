import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _normalize_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("0"):
        phone = "233" + phone[1:]
    elif phone.startswith("+"):
        phone = phone[1:]
    return phone


def send_sms(phone, message):
    if not phone:
        logger.error("SMS skipped: no phone number provided")
        return {"status": "error", "message": "No phone number"}
    try:
        url = "https://api.mnotify.com/api/sms/quick"
        payload = {
            "key": settings.MNOTIFY_API_KEY,
            "recipient[]": _normalize_phone(phone),
            "message": message,
            "sender": settings.MNOTIFY_SENDER_ID,
        }
        logger.warning("SMS payload (no key): %s", {k: v for k, v in payload.items() if k != "key"})
        resp = requests.post(url, data=payload, timeout=10)
        result = resp.json()
        logger.warning("SMS response status=%s body=%s", resp.status_code, result)
        return result
    except Exception as e:
        logger.error("SMS exception: %s", e)
        return {"status": "error", "message": str(e)}
