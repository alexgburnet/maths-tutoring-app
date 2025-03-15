from app import app, db, User
from flask_migrate import upgrade
from sqlalchemy.exc import ProgrammingError, OperationalError

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
            print("🔄 Running database migrations...")
            upgrade()
            print("✅ Migrations complete.")
        except (ProgrammingError, OperationalError) as e:
            print(f"⚠️  Migration skipped or failed: {e}")

        try:
            ensure_admin()
        except Exception as e:
            print(f"⚠️  Could not create admin: {e}")