import requests
from django.conf import settings


def send_sms(phone, message):
    try:
        url = "https://api.mnotify.com/api/sms/quick"
        payload = {
            "key": settings.MNOTIFY_API_KEY,
            "to[]": phone,
            "msg": message,
            "sender_id": settings.MNOTIFY_SENDER_ID,
        }
        resp = requests.post(url, data=payload, timeout=10)
        return resp.json()
    except Exception as e:
        return {"status": "error", "message": str(e)}
