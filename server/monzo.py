from dotenv import load_dotenv
import os
import requests

load_dotenv()

class MonzoClient:
    def __init__(self):
        self.base_url = "https://api.monzo.com"
        self.client_id = os.getenv("MONZO_CLIENT_ID")
        self.client_secret = os.getenv("MONZO_CLIENT_SECRET")
        self.refresh_token = os.getenv("MONZO_REFRESH_TOKEN")
        self.account_id = os.getenv("MONZO_ACCOUNT_ID")
        self.access_token = os.getenv("MONZO_ACCESS_TOKEN")
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

    def refresh_access_token(self):
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

        if response.status_code != 200:
            raise Exception(f"❌ Failed to refresh token: {response.status_code} - {response.text}")

        new_token = response.json()["access_token"]
        self.access_token = new_token
        self.headers = {"Authorization": f"Bearer {self.access_token}"}
        print("✅ Token refreshed!")

        # Optionally, write it back to the .env file or to a secrets file
        with open(".env", "r") as f:
            lines = f.readlines()
        with open(".env", "w") as f:
            for line in lines:
                if not line.startswith("MONZO_ACCESS_TOKEN="):
                    f.write(line)
            f.write(f"MONZO_ACCESS_TOKEN={new_token}\n")

    def get_transactions(self, since=None, limit=None, retry=True):
        params = {"account_id": self.account_id}
        if since:
            params["since"] = since
        if limit:
            params["limit"] = limit

        response = requests.get(f"{self.base_url}/transactions", headers=self.headers, params=params)

        if response.status_code == 401 and retry:
            # Token expired — try to refresh
            self.refresh_access_token()
            return self.get_transactions(since=since, limit=limit, retry=False)

        if response.status_code != 200:
            raise Exception(f"Failed to fetch transactions: {response.status_code} - {response.text}")
        
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