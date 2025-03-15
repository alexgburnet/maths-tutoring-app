from app import app, db, User
from flask_migrate import upgrade

with app.app_context():
    # Run migrations (this will upgrade the DB safely)
    print("🔄 Running migrations...")
    upgrade()

    # Ensure admin user exists
    admin_email = "alexburnet03@gmail.com"
    admin = User.query.filter_by(email=admin_email).first()

    if not admin:
        print(f"👤 Creating admin user: {admin_email}")
        admin = User(email=admin_email, is_admin=True)
        admin.set_password("changeme")  # ⚠️ Update this manually later!
        db.session.add(admin)
        db.session.commit()
    else:
        if not admin.is_admin:
            print(f"🔐 Promoting existing user to admin: {admin_email}")
            admin.is_admin = True
            db.session.commit()

    print("✅ Startup checks complete.")