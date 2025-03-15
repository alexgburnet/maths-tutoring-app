from dotenv import load_dotenv
import os
import requests

load_dotenv()

class MonzoClient:
    def __init__(self):
        self.access_token = os.getenv("ACCESS_TOKEN")
        self.account_id = os.getenv("ACCOUNT_ID")
        self.base_url = "https://api.monzo.com"
        self.headers = {"Authorization": f"Bearer {self.access_token}"}

    def get_transactions(self, since=None, limit=None):
        params = {"account_id": self.account_id}
        if since:
            params["since"] = since
        if limit:
            params["limit"] = limit

        response = requests.get(f"{self.base_url}/transactions", headers=self.headers, params=params)
        if response.status_code != 200:
            raise Exception(f"Failed to fetch transactions: {response.status_code} - {response.text}")
        
        return response.json()["transactions"]
    
    def get_transactions_by_reference(self, reference: str, since=None, limit=100):
        """
        Returns a list of transactions where the reference string appears in
        the transaction description or metadata['reference'].
        """
        reference = reference.lower()
        results = []

        # Fetch transactions (e.g. last 100, or since a date)
        transactions = self.get_transactions(since=since, limit=limit)

        for txn in transactions:
            description = txn.get("description", "").lower()
            metadata_ref = txn.get("metadata", {}).get("reference", "").lower()

            if reference in description or reference in metadata_ref:
                results.append(txn)

        return results

    def print_transactions(self, since=None, limit=10):
        transactions = self.get_transactions(since=since, limit=limit)
        for txn in transactions:
            amount = txn["amount"] / 100
            print(f"{txn['created']} - {txn['description']} - £{amount:.2f}")