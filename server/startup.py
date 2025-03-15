import os
import shutil
from app import app, db, User
from flask_migrate import init, migrate, upgrade
from sqlalchemy.exc import OperationalError

def ensure_admin():
    email = "admin@alexbur.net"
    if not User.query.filter_by(email=email).first():
        print(f"Creating admin account: {email}")
        user = User(email=email, is_admin=True)
        user.set_password("changeme123")  # Replace this!
        db.session.add(user)
        db.session.commit()
    else:
        print("✅ Admin user already exists.")

if __name__ == "__main__":
    with app.app_context():
        try:
            print("⚠️ Dropping all tables...")
            db.drop_all()
            db.session.commit()
            print("✅ Tables dropped.")
        except OperationalError as e:
            print(f"⚠️ Could not drop tables: {e}")

        # Remove old migrations folder if exists
        if os.path.exists("migrations"):
            print("🧹 Removing old migrations...")
            shutil.rmtree("migrations")

        try:
            print("📁 Initializing migrations...")
            init()
            print("📝 Generating initial migration...")
            migrate(message="initial")
            print("📦 Upgrading database...")
            upgrade()
            print("✅ Database migrated successfully.")
        except Exception as e:
            print(f"❌ Migration failed: {e}")

        try:
            ensure_admin()
        except Exception as e:
            print(f"⚠️  Could not create admin: {e}")