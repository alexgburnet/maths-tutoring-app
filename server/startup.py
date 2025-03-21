from app import app, db, User
from flask_migrate import migrate, upgrade
from sqlalchemy.exc import OperationalError
import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

def ensure_admin():
    email = "admin@alexbur.net"
    user = User.query.filter_by(email=email).first()

    if user:
        if not user.is_admin:
            user.is_admin = True
            db.session.commit()
            print("✅ Existing user updated to admin.")
        else:
            print("✅ Admin user already exists.")
    else:
        print(f"➕ Creating new admin account: {email}")
        user = User(email=email, is_admin=True)
        user.set_password(ADMIN_PASSWORD)  # You may want to rotate this
        db.session.add(user)
        db.session.commit()
        print("✅ Admin user created.")

if __name__ == "__main__":
    with app.app_context():
        try:
            print("🔄 Running database migration...")
            migrate(message="auto migration")
            upgrade()
            print("✅ Migration complete.")
        except OperationalError as e:
            print(f"⚠️ Migration failed or skipped: {e}")

        try:
            ensure_admin()
        except Exception as e:
            print(f"⚠️ Could not ensure admin: {e}")