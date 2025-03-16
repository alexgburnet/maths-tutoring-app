from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import jwt as pyjwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from flask_migrate import Migrate
from monzo import MonzoClient
from zoom import create_zoom_meeting, delete_zoom_meeting

# Load .env file
load_dotenv()

# Init Flask
app = Flask(__name__)
CORS(app)

# Database config
DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DB")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", 5432)


print(f"Connecting to database at {DB_HOST}:{DB_PORT}...")

app.config["SQLALCHEMY_DATABASE_URI"] = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Init DB
db = SQLAlchemy(app)
migrate = Migrate(app, db)

SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")

def update_paid_status_for_bookings():
    monzo = MonzoClient()
    unpaid_bookings = Booking.query.filter_by(is_paid=False).all()
    
    for booking in unpaid_bookings:
        if not booking.payment_ref:
            continue

        matches = monzo.get_transactions_by_reference(booking.payment_ref)
        if matches:
            booking.is_paid = True
            print(f"[✓] Marked booking {booking.id} as paid.")
    
    db.session.commit()

from functools import wraps

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="bookings")

    slot_id = db.Column(db.Integer, db.ForeignKey("available_slot.id"))
    slot = db.relationship("AvailableSlot", backref="booking")

    payment_ref = db.Column(db.String(64), unique=True)
    is_paid = db.Column(db.Boolean, default=False)

    zoom_link = db.Column(db.String(512))
    zoom_meeting_id = db.Column(db.String(128))

    def to_dict(self):
        return {
            "id": self.id,
            "student_name": self.student_name,
            "topic": self.topic,
            "scheduled_time": self.scheduled_time.isoformat(),
            "slot_id": self.slot_id,
            "user_name": self.user.name if self.user else None,
            "payment_ref": self.payment_ref,
            "is_paid": self.is_paid,
            "zoom_link": self.zoom_link,
            "zoom_meeting_id": self.zoom_meeting_id,
        }
    
class AvailableSlot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=60)
    booked = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "start_time": self.start_time.isoformat(),
            "duration_minutes": self.duration_minutes,
            "booked": self.booked,
        }
    
# Auth Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        try:
            payload = pyjwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(payload["user_id"])
            if not user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401

        return f(user, *args, **kwargs)
    return decorated
    
def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return f(current_user, *args, **kwargs)
    return decorated

# Create tables
with app.app_context():
    print("Creating database tables (if not exists)...")
    db.create_all()

# Routes

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(
        name=data.get("name", ""),  # ✅ prevents KeyError
        email=data["email"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    payload = {
        "user_id": user.id,
        "is_admin": user.is_admin,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = pyjwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "user_id": user.id,
        "is_admin": user.is_admin,
        "name": user.name,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = pyjwt.encode(payload, SECRET_KEY, algorithm="HS256")

    print(f"User {user.email} logged in")
    return jsonify({"token": token})

@app.route("/api/bookings", methods=["POST"])
@token_required
def create_booking(current_user):
    data = request.json
    try:
        scheduled_time = datetime.fromisoformat(data["scheduled_time"])
        slot = AvailableSlot.query.filter_by(start_time=scheduled_time, booked=False).first()

        if not slot:
            return jsonify({"error": "Slot is not available"}), 400

        payment_ref = str(uuid.uuid4())[:8]  # Short, unique, user-safe

        booking = Booking(
            student_name=data["student_name"],
            topic=data["topic"],
            scheduled_time=scheduled_time,
            user_id=current_user.id,
            slot_id=slot.id,
            payment_ref=payment_ref
        )

        slot.booked = True

        zoom_meeting = create_zoom_meeting(
            student_name=data["student_name"],
            student_email=current_user.email,
            start_time_iso=data["scheduled_time"]
        )

        booking.zoom_link = zoom_meeting["join_url"]
        booking.zoom_meeting_id = zoom_meeting["id"]

        db.session.add(booking)
        db.session.commit()

        return jsonify(booking.to_dict()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/api/admin/slots", methods=["POST"])
@admin_required
def add_slot(current_user):
    data = request.json
    try:
        slot = AvailableSlot(
            start_time=datetime.fromisoformat(data["start_time"]),
            duration_minutes=data.get("duration_minutes", 60),
        )
        db.session.add(slot)
        db.session.commit()
        return jsonify(slot.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
@app.route("/api/slots", methods=["GET"])
@token_required
def get_available_slots(current_user):
    slots = AvailableSlot.query.filter_by(booked=False).order_by(AvailableSlot.start_time).all()
    return jsonify([s.to_dict() for s in slots])

@app.route("/api/bookings", methods=["GET"])
@token_required
def get_all_bookings(current_user):
    bookings = Booking.query.filter_by(user_id=current_user.id).all()
    print(f"User {current_user.email} requested their bookings")
    return jsonify([b.to_dict() for b in bookings])

@app.route("/api/bookings/<int:booking_id>", methods=["GET"])
def get_booking(booking_id):
    print(f"Received GET /api/bookings/{booking_id}")
    booking = Booking.query.get_or_404(booking_id)
    return jsonify(booking.to_dict())

@app.route("/api/bookings/<int:booking_id>", methods=["DELETE"])
@token_required
def delete_booking(current_user, booking_id):
    booking = Booking.query.get_or_404(booking_id)

    print("Zoom meeting ID:", booking.zoom_meeting_id)

    # Ensure only the owner can delete
    if booking.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    if booking.zoom_meeting_id:
        try:
            delete_zoom_meeting(booking.zoom_meeting_id)
        except Exception as e:
            print(f"Warning: Failed to delete Zoom meeting: {e}")

    db.session.delete(booking)
    db.session.commit()

    return jsonify({"message": "Booking deleted"})

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([
        {"id": u.id, "email": u.email, "is_admin": u.is_admin}
        for u in users
    ])

@app.route("/api/admin/bookings", methods=["GET"])
@admin_required
def get_admin_bookings(current_user):
    bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/api/admin/slots/<int:slot_id>", methods=["DELETE"])
@admin_required
def delete_slot(current_user, slot_id):
    slot = AvailableSlot.query.get_or_404(slot_id)

    if slot.booked:
        return jsonify({"error": "Slot is already booked"}), 400

    db.session.delete(slot)
    db.session.commit()
    return jsonify({"message": "Slot deleted"})

@app.route("/api/admin/assign-slot", methods=["POST"])
@admin_required
def assign_slot(current_user):
    data = request.json
    slot = AvailableSlot.query.get_or_404(data["slot_id"])
    user = User.query.get_or_404(data["user_id"])

    if slot.booked:
        return jsonify({"error": "Slot already booked"}), 400
    
    student_name = user.email.split("@")[0] if not hasattr(user, "name") else user.name

    try:
        zoom_meeting = create_zoom_meeting(user.name, user.email, slot.start_time.isoformat())
    except Exception as e:
        return jsonify({"error": f"Failed to create Zoom meeting: {str(e)}"}), 500

    booking = Booking(
        student_name=user.name,
        topic=data.get("topic", "Admin-assigned"),
        scheduled_time=slot.start_time,
        user_id=user.id,
        slot_id=slot.id,
        zoom_link=zoom_meeting["join_url"],
        zoom_meeting_id=zoom_meeting["id"]
    )

    slot.booked = True
    db.session.add(booking)
    db.session.commit()

    return jsonify(booking.to_dict()), 201

@app.route("/api/admin/check-payments", methods=["POST"])
@admin_required
def manual_payment_check(current_user):
    update_paid_status_for_bookings()
    return jsonify({"status": "Payment statuses updated."})

@app.route("/api/admin/mark-paid/<int:booking_id>", methods=["POST"])
@admin_required
def mark_booking_paid(current_user, booking_id):
    booking = Booking.query.get_or_404(booking_id)
    booking.is_paid = True
    db.session.commit()
    return jsonify({"status": "Booking marked as paid"})