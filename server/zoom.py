import os
import requests
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")
ZOOM_ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID")

def get_zoom_access_token():
    url = "https://zoom.us/oauth/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "account_credentials",
        "account_id": ZOOM_ACCOUNT_ID
    }

    response = requests.post(
        url,
        headers=headers,
        data=data,
        auth=(ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)
    )

    if response.status_code != 200:
        raise Exception(f"Failed to get Zoom access token: {response.text}")
    
    return response.json()["access_token"]

def create_zoom_meeting(student_name, start_time_iso):
    access_token = get_zoom_access_token()

    url = "https://api.zoom.us/v2/users/me/meetings"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Convert to UTC if needed
    start_dt = datetime.fromisoformat(start_time_iso)
    start_utc = start_dt.astimezone(timezone.utc).isoformat()

    payload = {
        "topic": f"Maths Tutorial - {student_name}",
        "type": 2,  # Scheduled meeting
        "start_time": start_utc,
        "duration": 60,
        "timezone": "UTC",
        "settings": {
            "join_before_host": False,
            "approval_type": 0,
            "waiting_room": True
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 201:
        raise Exception(f"Failed to create Zoom meeting: {response.text}")

    return response.json()  # Includes join_url and start_url