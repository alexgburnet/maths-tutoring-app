from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import jwt as pyjwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

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

SECRET_KEY = os.getenv("SECRET_KEY", "devsecret")

from functools import wraps

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

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)  # ⬅️ updated

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Booking model
class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="bookings")

    def to_dict(self):
        return {
            "id": self.id,
            "student_name": self.student_name,
            "topic": self.topic,
            "scheduled_time": self.scheduled_time.isoformat()
        }

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

    user = User(email=data["email"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    print(f"Registered user: {data['email']}")
    return jsonify({"message": "User registered"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    print(f"User {user.email} logged in")
    return jsonify({"token": token})

@app.route("/api/bookings", methods=["POST"])
@token_required
def create_booking(current_user):
    data = request.json
    print(f"User {current_user.email} creating booking with: {data}")
    try:
        booking = Booking(
            student_name=data["student_name"],
            topic=data["topic"],
            scheduled_time=datetime.fromisoformat(data["scheduled_time"]),
            user_id=current_user.id  # 👈 tie to logged-in user
        )
        db.session.add(booking)
        db.session.commit()
        return jsonify(booking.to_dict()), 201
    except Exception as e:
        print(f"Error creating booking: {e}")
        return jsonify({"error": str(e)}), 400

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
def delete_booking(booking_id):
    print(f"Received DELETE /api/bookings/{booking_id}")
    booking = Booking.query.get_or_404(booking_id)
    db.session.delete(booking)
    db.session.commit()
    print(f"Deleted booking {booking_id}")
    return jsonify({"message": "Booking deleted"})