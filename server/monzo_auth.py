from flask import Flask, request
import requests
import webbrowser
import os
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("MONZO_CLIENT_ID")
CLIENT_SECRET = os.getenv("MONZO_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5000/callback"
AUTH_URL = f"https://auth.monzo.com/?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&response_type=code&state=secure123"

app = Flask(__name__)

@app.route("/callback")
def oauth_callback():
    code = request.args.get("code")
    if not code:
        return "❌ No code received."

    print(f"🔐 Received code: {code}")
    print("📡 Exchanging code for tokens...")

    token_response = requests.post(
        "https://api.monzo.com/oauth2/token",
        data={
            "grant_type": "authorization_code",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "code": code,
        },
    )

    if token_response.status_code != 200:
        print("❌ Token exchange failed:", token_response.text)
        return f"❌ Failed to get tokens: {token_response.text}"

    data = token_response.json()
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    print("✅ Got tokens!")
    print("🔑 Access Token:", access_token)
    print("🔁 Refresh Token:", refresh_token)

    # Update .env
    with open(".env", "r") as f:
        lines = f.readlines()

    with open(".env", "w") as f:
        for line in lines:
            if not line.startswith("MONZO_ACCESS_TOKEN=") and not line.startswith("MONZO_REFRESH_TOKEN="):
                f.write(line)
        f.write(f"MONZO_ACCESS_TOKEN={access_token}\n")
        f.write(f"MONZO_REFRESH_TOKEN={refresh_token}\n")

    return "✅ Tokens received and saved! You can close this tab."

if __name__ == "__main__":
    print("🌐 Opening browser for Monzo authorization...")
    webbrowser.open(AUTH_URL)
    print("🚀 Waiting for authorization callback...")
    app.run(port=5000)