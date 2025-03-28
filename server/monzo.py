import os
import time
import requests

REFRESH_TOKEN_PATH = "/app/secrets/refresh_token.txt"

def load_refresh_token(from_env_fallback=True):
    if os.path.exists(REFRESH_TOKEN_PATH):
        with open(REFRESH_TOKEN_PATH, "r") as f:
            return f.read().strip()
    return os.getenv("MONZO_REFRESH_TOKEN") if from_env_fallback else None

def save_refresh_token(token):
    with open(REFRESH_TOKEN_PATH, "w") as f:
        f.write(token)

class MonzoClient:
    def __init__(self):
        self.base_url = "https://api.monzo.com"
        self.client_id = os.getenv("MONZO_CLIENT_ID")
        self.client_secret = os.getenv("MONZO_CLIENT_SECRET")
        self.account_id = os.getenv("MONZO_ACCOUNT_ID")

        self.refresh_token = load_refresh_token()
        self.access_token = None
        self.token_expires_at = 0

    def refresh_access_token(self, fallback_attempt=False):
        print("🔁 Refreshing Monzo access token...")

        response = requests.post(
            f"{self.base_url}/oauth2/token",
            data={
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": self.refresh_token,
            }
        )

        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data["access_token"]
            self.refresh_token = token_data["refresh_token"]
            save_refresh_token(self.refresh_token)

            expires_in = token_data.get("expires_in", 3600)
            self.token_expires_at = time.time() + expires_in - 60
            print("✅ Token refreshed successfully!")
        else:
            print(f"❌ Failed to refresh token: {response.status_code} - {response.text}")

            if not fallback_attempt:
                print("🔁 Attempting fallback to .env refresh token...")
                self.refresh_token = load_refresh_token(from_env_fallback=True)
                self.refresh_access_token(fallback_attempt=True)
            else:
                raise Exception("❌ Token refresh failed even with fallback")

    def get_access_token(self):
        if time.time() >= self.token_expires_at:
            self.refresh_access_token()
        return self.access_token

    def get_headers(self):
        return {"Authorization": f"Bearer {self.get_access_token()}"}

    def get_transactions(self, since=None, limit=None, retry=True):
        params = {"account_id": self.account_id}
        if since:
            params["since"] = since
        if limit:
            params["limit"] = limit

        response = requests.get(f"{self.base_url}/transactions", headers=self.get_headers(), params=params)

        if response.status_code == 401 and retry:
            print("⚠️ Access token expired, retrying after refresh...")
            self.refresh_access_token()
            return self.get_transactions(since=since, limit=limit, retry=False)

        if response.status_code != 200:
            raise Exception(f"❌ Failed to fetch transactions: {response.status_code} - {response.text}")
        
        return response.json()["transactions"]

    def get_transactions_by_reference(self, reference: str, since=None, limit=100):
        reference = reference.lower()
        results = []

        transactions = self.get_transactions(since=since, limit=limit)

        for txn in transactions:
            description = txn.get("description", "").lower()
            metadata_ref = txn.get("metadata", {}).get("reference", "").lower()

            if reference in description or reference in metadata_ref:
                results.append(txn)

        return results