from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

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

# Booking model
class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    scheduled_time = db.Column(db.DateTime, nullable=False)

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

@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.json
    print(f"Received POST /api/bookings with data: {data}")
    try:
        booking = Booking(
            student_name=data["student_name"],
            topic=data["topic"],
            scheduled_time=datetime.fromisoformat(data["scheduled_time"])
        )
        db.session.add(booking)
        db.session.commit()
        print(f"Created booking with ID {booking.id}")
        return jsonify(booking.to_dict()), 201
    except Exception as e:
        print(f"Error creating booking: {e}")
        return jsonify({"error": str(e)}), 400

@app.route("/api/bookings", methods=["GET"])
def get_all_bookings():
    print("Received GET /api/bookings")
    bookings = Booking.query.all()
    print(f"Returning {len(bookings)} bookings")
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