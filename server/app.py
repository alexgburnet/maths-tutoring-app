from flask import Flask, request, jsonify, send_from_directory, send_file, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc
from sqlalchemy.orm import joinedload
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
from werkzeug.utils import secure_filename
from functools import wraps
from datetime import date

from mathpix_helper import extract_latex_from_pdf
from openai_helper import generate_followup_questions_latex, generate_weekly_plan_openai
from pdflatex_helper import render_latex_to_pdf
from sqlalchemy import and_
import logging

import threading
import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# Load .env file
load_dotenv()
app = Flask(__name__)
CORS(app, supports_credentials=True)

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

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'notes')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

monzo_client = MonzoClient()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def update_paid_status_for_bookings():
    unpaid_bookings = Booking.query.filter_by(is_paid=False).all()
    
    for booking in unpaid_bookings:
        if not booking.payment_ref:
            continue

        matches = monzo_client.get_transactions_by_reference(booking.payment_ref)
        # check transaction amount to be £20
        if matches and matches[0]["amount"] >= 2000:
            booking.is_paid = True
            print(f"[✓] Marked booking {booking.id} as paid.")
    
    db.session.commit()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    surname = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    target_grade = db.Column(db.Integer)
    maths_paper = db.Column(db.String(1))
    exam_date = db.Column(db.Date)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(100), nullable=False)
    custom_topic = db.Column(db.String(200), nullable=True)
    scheduled_time = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="bookings")

    slot_id = db.Column(db.Integer, db.ForeignKey("available_slot.id"))
    slot = db.relationship("AvailableSlot", backref="booking")

    weekly_plan_subtopic_id = db.Column(db.Integer, db.ForeignKey("weekly_plan_subtopic.id"), nullable=True)
    weekly_plan_subtopic = db.relationship("WeeklyPlanSubtopic", backref="bookings")

    payment_ref = db.Column(db.String(64), unique=True)
    is_paid = db.Column(db.Boolean, default=False)

    zoom_link = db.Column(db.String(512))
    zoom_meeting_id = db.Column(db.String(128))

    notes_filename = db.Column(db.String(255), nullable=True)
    followup_filename = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        topic_display = self.custom_topic
        topic_id = None
        subtopic_id = None
        subtopic_title = None
        entry_id = None
        entry_completed = None

        if self.weekly_plan_subtopic:
            try:
                entry = self.weekly_plan_subtopic.entry
                topic_display = entry.topic.name
                topic_id = entry.topic.id
                entry_id = entry.id
                entry_completed = entry.completed
                subtopic = self.weekly_plan_subtopic.question
                subtopic_id = subtopic.id
                subtopic_title = subtopic.title
            except AttributeError as e:
                topic_display = "Topic from Plan (Details Unavailable)"
                logging.warning(f"Could not fully resolve topic/entry details for booking {self.id} from subtopic {self.weekly_plan_subtopic_id}: {e}")
        elif not topic_display:
            topic_display = "General Discussion"

        return {
            "id": self.id,
            "student_name": self.student_name,
            "topic_display": topic_display,
            "custom_topic": self.custom_topic,
            "topic_id": topic_id,
            "weekly_plan_subtopic_id": self.weekly_plan_subtopic_id,
            "subtopic_title": subtopic_title,
            "entry_id": entry_id,
            "entry_completed": entry_completed,
            "scheduled_time": self.scheduled_time.isoformat(),
            "slot_id": self.slot_id,
            "user_name": self.user.name if self.user else None,
            "payment_ref": self.payment_ref,
            "is_paid": self.is_paid,
            "zoom_link": self.zoom_link,
            "zoom_meeting_id": self.zoom_meeting_id,
            "notes_url": f"https://tutoring.alexbur.net/uploads/notes/{self.notes_filename}" if self.notes_filename else None,
            "followup_url": f"https://tutoring.alexbur.net/uploads/notes/{self.followup_filename}" if self.followup_filename else None,
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
    
class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(100))  # e.g., Algebra, Geometry
    weight = db.Column(db.Float, default=1.0)  # Importance for grade calculation

class SelfAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="assessments")

class TopicAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey("self_assessment.id"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("topic_question.id"), nullable=False)
    confidence_score = db.Column(db.Integer, nullable=False)

    question = db.relationship("TopicQuestion")
    assessment = db.relationship("SelfAssessment", backref="topic_assessments")

class WeeklyPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    exam_date = db.Column(db.DateTime, nullable=False)
    target_grade = db.Column(db.String(10), nullable=False)
    current_grade = db.Column(db.String(10), nullable=True)  # Optional predicted grade

    user = db.relationship("User", backref="weekly_plans")

class WeeklyPlanEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("weekly_plan.id"), nullable=False)
    week_number = db.Column(db.Integer, nullable=False)
    topic_id = db.Column(db.Integer, db.ForeignKey("topic.id"), nullable=False)
    focus_area = db.Column(db.String(255))  # Optional note or subtopic
    completed = db.Column(db.Boolean, default=False, nullable=False)

    plan = db.relationship("WeeklyPlan", backref="entries")
    topic = db.relationship("Topic")

class WeeklyPlanSubtopic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey("weekly_plan_entry.id"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("topic_question.id"), nullable=False)

    entry = db.relationship("WeeklyPlanEntry", backref="subtopics")
    question = db.relationship("TopicQuestion")

class TopicQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey("topic.id"), nullable=False)
    title = db.Column(db.String(100), nullable=False)  # e.g. "Simultaneous Equations"
    tier = db.Column(db.String(20), nullable=False)  # "Foundation" or "Higher"
    weight = db.Column(db.Float, default=1.0)  # importance for topic-level confidence

    topic = db.relationship("Topic", backref="questions")
    descriptors = db.relationship("ConfidenceDescriptor", backref="question", lazy=True)

class ConfidenceDescriptor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey("topic_question.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # 0–5
    description = db.Column(db.String(255), nullable=False)


# Auth Decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        # Support "Bearer <token>" or just "<token>"
        if not token:
            return jsonify({"error": "Token is missing"}), 401

        if token.startswith("Bearer "):
            token = token.split(" ")[1]

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

def compute_topic_confidences(assessment_id):
    assessment = SelfAssessment.query.options(
        joinedload(SelfAssessment.topic_assessments)
        .joinedload(TopicAssessment.question)
        .joinedload(TopicQuestion.topic)
    ).get(assessment_id)

    topic_confidence = {}

    for ta in assessment.topic_assessments:
        topic = ta.question.topic
        weight = ta.question.weight
        score = ta.confidence_score

        if topic.id not in topic_confidence:
            topic_confidence[topic.id] = {
                "topic_name": topic.name,
                "weighted_sum": 0.0,
                "total_weight": 0.0
            }

        topic_confidence[topic.id]["weighted_sum"] += score * weight
        topic_confidence[topic.id]["total_weight"] += weight

    # Compute average
    results = {}
    for topic_id, data in topic_confidence.items():
        average = data["weighted_sum"] / data["total_weight"]
        results[data["topic_name"]] = round(average, 2)

    return results

# Routes

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(
        name=data.get("name"),
        surname=data.get("surname"),
        email=data["email"]
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()

    access_payload = {
        "user_id": user.id,
        "is_admin": user.is_admin,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "maths_paper": user.maths_paper,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    refresh_payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }

    access_token = pyjwt.encode(access_payload, SECRET_KEY, algorithm="HS256")
    refresh_token = pyjwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")

    response = jsonify({"access_token": access_token})

    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=60 * 60 * 24 * 30  # 30 days
    )

    return response

@app.route("/api/user/update-details", methods=["POST"])
@token_required
def update_user_details(current_user):
    data = request.json

    # Allow updating name, surname, and email
    name = data.get("name")
    surname = data.get("surname")
    email = data.get("email")

    if email and email != current_user.email:
        # Check if email is already in use
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 400
        current_user.email = email

    if name:
        current_user.name = name

    if surname:
        current_user.surname = surname

    db.session.commit()
    return jsonify({"message": "User details updated"})

@app.route("/api/user/change-password", methods=["POST"])
@token_required
def change_password(current_user):
    data = request.json

    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not current_user.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 400

    if not new_password or len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"})

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_payload = {
        "user_id": user.id,
        "is_admin": user.is_admin,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    refresh_payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }

    access_token = pyjwt.encode(access_payload, SECRET_KEY, algorithm="HS256")
    refresh_token = pyjwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")

    response = jsonify({"access_token": access_token})

    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=60 * 60 * 24 * 30  # 30 days
    )

    return response


@app.route("/api/refresh", methods=["POST"])
def refresh():
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return jsonify({"error": "No refresh token"}), 401

    try:
        payload = pyjwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["user_id"]

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 401

        new_access_token = pyjwt.encode({
            "user_id": user.id,
            "is_admin": user.is_admin,
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "maths_paper": user.maths_paper,
            "exp": datetime.utcnow() + timedelta(minutes=15),
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({ "access_token": new_access_token })

    except Exception as e:
        return jsonify({ "error": f"Invalid refresh token: {str(e)}" }), 401
    
@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({ "message": "Logged out successfully" })
    
    # Overwrite the refresh cookie with Max-Age = 0 to delete it
    response.set_cookie(
        "refresh_token",
        "",
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=0
    )

    return response

@app.route("/api/admin/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user_info(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.json

    user.target_grade = data.get("target_grade")
    user.exam_date = datetime.strptime(data.get("exam_date"), "%Y-%m-%d") if data.get("exam_date") else None
    user.maths_paper = data.get("maths_paper")

    db.session.commit()
    return jsonify({"message": "User updated"})

@app.route("/api/bookings", methods=["POST"])
@token_required
def create_booking(current_user):
    data = request.json
    try:
        slot_id = data.get("slot_id")
        weekly_plan_subtopic_id = data.get("weekly_plan_subtopic_id") # Optional: Explicit ID from plan (not used by current form)
        custom_topic = data.get("custom_topic") # Optional: User-defined topic string OR "Week X: ..."

        if not slot_id:
             return jsonify({"error": "Slot ID is required"}), 400
             
        # Validate input: Need either an explicit subtopic ID OR a custom topic string
        if not (weekly_plan_subtopic_id or custom_topic):
             return jsonify({"error": "A topic must be provided (either selected from plan or custom)"}), 400
        if weekly_plan_subtopic_id and custom_topic:
             # This case shouldn't happen with the current form logic but good to keep validation
             return jsonify({"error": "Provide either a weekly plan subtopic ID or a custom topic, not both"}), 400

        slot = AvailableSlot.query.get(slot_id)
        if not slot or slot.booked:
            return jsonify({"error": "Slot is not available"}), 400
            
        # --- Logic to potentially link to a subtopic/entry if custom_topic matches a week --- 
        derived_subtopic_id = weekly_plan_subtopic_id # Start with explicitly provided ID
        
        if custom_topic and not derived_subtopic_id and custom_topic.startswith("Week "):
            try:
                # Extract week number
                week_num_str = custom_topic.split(':')[0].split(' ')[1]
                week_num = int(week_num_str)
                
                # Find the latest plan for the user
                latest_plan = WeeklyPlan.query.filter_by(user_id=current_user.id).order_by(WeeklyPlan.generated_at.desc()).first()
                
                if latest_plan:
                    # Find the first *incomplete* entry for that week in that plan
                    first_entry_for_week = WeeklyPlanEntry.query.filter_by(
                        plan_id=latest_plan.id,
                        week_number=week_num,
                        completed=False
                    ).order_by(WeeklyPlanEntry.id).first() # Order for consistency

                    if first_entry_for_week:
                         # Find the first subtopic associated with that entry
                         first_subtopic = WeeklyPlanSubtopic.query.filter_by(
                             entry_id=first_entry_for_week.id
                         ).order_by(WeeklyPlanSubtopic.id).first() # Order for consistency
                         
                         if first_subtopic:
                              derived_subtopic_id = first_subtopic.id
                              logging.info(f"Booking for '{custom_topic}' automatically linked to WeeklyPlanSubtopic ID {derived_subtopic_id} (via Entry ID {first_entry_for_week.id})")
                         else:
                              logging.warning(f"Could not auto-link booking for '{custom_topic}': No subtopics found for Entry ID {first_entry_for_week.id}.")
                    else:
                         logging.warning(f"Could not auto-link booking for '{custom_topic}': No incomplete WeeklyPlanEntry found for user {current_user.id}, week {week_num}.")
                else:
                     logging.warning(f"Could not auto-link booking for '{custom_topic}': No WeeklyPlan found for user {current_user.id}.")

            except (IndexError, ValueError) as e:
                logging.warning(f"Could not parse week number from custom_topic '{custom_topic}': {e}")
            except Exception as e:
                 logging.error(f"Unexpected error during auto-linking logic for custom_topic '{custom_topic}': {e}", exc_info=True)

        # --- End of auto-linking logic --- 
        
        # Validate derived_subtopic_id if it was found/provided
        if derived_subtopic_id:
            subtopic = WeeklyPlanSubtopic.query.get(derived_subtopic_id)
            if not subtopic:
                 # This could happen if the ID provided was invalid, or auto-linking failed badly
                 return jsonify({"error": f"Weekly plan subtopic with ID {derived_subtopic_id} not found"}), 404
            # Optional check if subtopic belongs to user can be added here if needed
            
        payment_ref = str(uuid.uuid4())[:8]

        booking = Booking(
            student_name=current_user.name,
            custom_topic=custom_topic, # Always store the original custom topic string
            weekly_plan_subtopic_id=derived_subtopic_id, # Store the explicit OR derived ID
            scheduled_time=slot.start_time,
            user_id=current_user.id,
            slot_id=slot.id,
            payment_ref=payment_ref
        )

        slot.booked = True

        if slot.start_time > datetime.utcnow():
             try:
                 zoom_meeting = create_zoom_meeting(
                     student_name=current_user.name,
                     student_surname=current_user.surname,
                     student_email=current_user.email,
                     start_time_iso=slot.start_time.isoformat()
                 )
                 booking.zoom_link = zoom_meeting["join_url"]
                 booking.zoom_meeting_id = zoom_meeting["id"]
             except Exception as e:
                  logging.error(f"Zoom creation failed during booking: {e}", exc_info=True)

        db.session.add(booking)
        db.session.commit()

        return jsonify(booking.to_dict()), 201

    except KeyError as e:
        return jsonify({"error": f"Missing required field: {e}"}), 400
    except Exception as e:
        logging.error(f"Error creating booking: {e}", exc_info=True)
        db.session.rollback() # Rollback on generic error
        return jsonify({"error": "An internal error occurred while creating the booking."}), 500

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
def get_all_slots(current_user):
    try:
        start = request.args.get("start")  # 'YYYY-MM-DD'
        end = request.args.get("end")      # 'YYYY-MM-DD'

        query = AvailableSlot.query

        if start:
            start_dt = datetime.strptime(start, "%Y-%m-%d")
            query = query.filter(AvailableSlot.start_time >= start_dt)

        if end:
            end_dt = datetime.strptime(end, "%Y-%m-%d") + timedelta(days=1)  # make inclusive
            query = query.filter(AvailableSlot.start_time < end_dt)

        slots = query.order_by(AvailableSlot.start_time).all()
        return jsonify([s.to_dict() for s in slots])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/bookings", methods=["GET"])
@token_required
def get_all_bookings(current_user):
    bookings = Booking.query.filter_by(user_id=current_user.id).order_by(desc(Booking.scheduled_time)).all()
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

    # Ensure only the owner or an admin can delete
    if booking.user_id != current_user.id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    print("Zoom meeting ID:", booking.zoom_meeting_id)

    # Delete Zoom meeting if it exists
    if booking.zoom_meeting_id:
        try:
            delete_zoom_meeting(booking.zoom_meeting_id)
        except Exception as e:
            print(f"⚠️ Warning: Failed to delete Zoom meeting: {e}")

    # Unmark slot as booked
    if booking.slot:
        booking.slot.booked = False  # ✅ Make slot available again

    db.session.delete(booking)
    db.session.commit()

    return jsonify({"message": "Booking deleted and slot made available again"})

@app.route("/api/admin/users", methods=["GET"])
@admin_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([
        {"id": u.id, "name": u.name, "surname": u.surname, "email": u.email, "is_admin": u.is_admin}
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

from datetime import datetime


from datetime import datetime
from uuid import uuid4

@app.route("/api/admin/assign-slot", methods=["POST"])
@admin_required
def assign_user_to_slot(current_user):
    data = request.json
    slot_id = data.get("slot_id")
    user_id = data.get("user_id")
    weekly_plan_subtopic_id = data.get("weekly_plan_subtopic_id") # Optional
    custom_topic = data.get("custom_topic") # Optional

    if not slot_id or not user_id:
        return jsonify({"error": "Slot ID and User ID are required"}), 400

    # Validate topic input: Allow either subtopic_id, custom_topic, or neither (defaults to General)
    if weekly_plan_subtopic_id and custom_topic:
         return jsonify({"error": "Provide either weekly_plan_subtopic_id or custom_topic, not both"}), 400

    user = User.query.get_or_404(user_id)
    slot = AvailableSlot.query.get_or_404(slot_id)

    if slot.booked:
        return jsonify({"error": "Slot already booked"}), 400
        
    # Validate weekly_plan_subtopic_id if provided
    if weekly_plan_subtopic_id:
        subtopic = WeeklyPlanSubtopic.query.get(weekly_plan_subtopic_id)
        if not subtopic:
            return jsonify({"error": f"Weekly plan subtopic with ID {weekly_plan_subtopic_id} not found"}), 404
        # Optional: Check if this subtopic belongs to the assigned user's plan?
        # if subtopic.entry.plan.user_id != user.id:
        #     return jsonify({"error": "Subtopic does not belong to the specified user's plan"}), 400

    payment_ref = str(uuid.uuid4())[:8]

    booking = Booking(
        student_name=user.name,
        # topic=topic, # REMOVED
        custom_topic=custom_topic,
        weekly_plan_subtopic_id=weekly_plan_subtopic_id,
        scheduled_time=slot.start_time,
        user_id=user.id,
        slot_id=slot.id,
        payment_ref=payment_ref
    )

    slot.booked = True

    if slot.start_time > datetime.utcnow():
        try:
            zoom_meeting = create_zoom_meeting(
                student_name=user.name,
                student_surname=user.surname,
                student_email=user.email,
                start_time_iso=slot.start_time.isoformat()
            )
            booking.zoom_link = zoom_meeting["join_url"]
            booking.zoom_meeting_id = zoom_meeting["id"]
        except Exception as e:
            logging.error(f"Zoom creation failed during admin assignment: {e}", exc_info=True)

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

@app.route("/api/bookings/<int:booking_id>/check_payment", methods=["POST"])
@token_required
def check_payment_status(current_user, booking_id):
    print(f"🔍 Received request to check payment for booking ID {booking_id}")
    
    try:
        booking = Booking.query.get_or_404(booking_id)

        if booking.is_paid:
            return jsonify({"message": "Already paid", "paid": True})

        transactions = monzo_client.get_transactions_by_reference(reference=booking.payment_ref)

        total_amount = sum(txn.get("amount", 0) for txn in transactions)
        print(f"💰 Total matched amount: {total_amount}p")

        if total_amount >= 2000:
            booking.is_paid = True
            db.session.commit()
            return jsonify({"message": "Payment found and marked as paid", "paid": True})
        else:
            return jsonify({"message": f"Total found: £{total_amount/100:.2f} — not enough", "paid": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/api/callback")
def oauth_callback():
    import requests

    code = request.args.get("code")
    print(f"🔐 Received authorization code: {code}")

    token_url = "https://api.monzo.com/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("MONZO_CLIENT_ID"),
        "client_secret": os.getenv("MONZO_CLIENT_SECRET"),
        "redirect_uri": "https://tutoring.alexbur.net/api/callback",
        "code": code,
    }

    response = requests.post(token_url, data=data)
    if response.status_code == 200:
        tokens = response.json()
        print("✅ Got tokens:", tokens)
        return jsonify(tokens)  # Or safely log/store them
    else:
        print("❌ Token exchange failed:", response.text)
        return "Failed to get tokens", 400

@app.route("/api/admin/upload-notes/<int:booking_id>", methods=["POST"])
@admin_required
def upload_notes(current_user, booking_id):
    logging.info(f"📥 Received notes upload for booking ID {booking_id}")
    
    booking = Booking.query.get_or_404(booking_id)
    if "notes" not in request.files:
        logging.warning("❌ No file part in request")
        return jsonify({"error": "No file part"}), 400

    file = request.files["notes"]
    if file.filename == "":
        logging.warning("❌ No selected file")
        return jsonify({"error": "No selected file"}), 400

    ext = os.path.splitext(file.filename)[1]
    unique_id = uuid.uuid4().hex[:8]
    filename = secure_filename(f"{booking_id}_{unique_id}{ext}")
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    logging.info(f"📄 Saving uploaded notes to: {file_path}")
    file.save(file_path)
    booking.notes_filename = filename

    try:
        logging.info("🔍 Extracting LaTeX from uploaded notes...")
        latex_text = extract_latex_from_pdf(file_path)

        logging.info("🤖 Generating follow-up questions with OpenAI...")
        followup_questions_latex = generate_followup_questions_latex(latex_text)

        followup_filename = secure_filename(f"{booking_id}_{uuid.uuid4().hex[:8]}_questions.pdf")
        followup_path = os.path.join(UPLOAD_FOLDER, followup_filename)

        logging.info(f"📘 Rendering LaTeX to PDF: {followup_path}")
        render_latex_to_pdf(followup_questions_latex, followup_path)

        booking.followup_filename = followup_filename
        logging.info(f"✅ Follow-up questions saved as: {followup_filename}")
    except Exception as e:
        logging.error("⚠️ Failed to process follow-up questions", exc_info=True)

    logging.info("💾 Committing changes to database...")
    db.session.commit()

    logging.info("✅ Notes upload and follow-up processing complete.")
    return jsonify({"message": "Notes uploaded successfully"})

@app.route("/uploads/notes/<filename>")
@token_required  # Optional if you want auth
def serve_notes_file(current_user, filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_file(
        file_path,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )

@app.route("/api/admin/delete-notes/<int:booking_id>", methods=["DELETE"])
@admin_required
def delete_notes(current_user, booking_id):
    booking = Booking.query.get_or_404(booking_id)

    if not booking.notes_filename and not booking.followup_filename:
        return jsonify({"error": "No notes or follow-up to delete"}), 400

    notes_path = os.path.join(app.config["UPLOAD_FOLDER"], booking.notes_filename) if booking.notes_filename else None
    followup_path = os.path.join(app.config["UPLOAD_FOLDER"], booking.followup_filename) if booking.followup_filename else None

    try:
        if notes_path and os.path.exists(notes_path):
            os.remove(notes_path)
            booking.notes_filename = None

        if followup_path and os.path.exists(followup_path):
            os.remove(followup_path)
            booking.followup_filename = None

        db.session.commit()
        return jsonify({"message": "Notes and follow-up deleted (if present)"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/monzo-auth")
def monzo_auth():
    client_id = os.getenv("MONZO_CLIENT_ID")
    redirect_uri = "https://tutoring.alexbur.net/api/callback"
    state = str(uuid.uuid4())  # Optional but good for CSRF protection

    auth_url = (
        f"https://auth.monzo.com/?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code&state={state}"
    )
    return f'<a href="{auth_url}">Click here to authorize Monzo</a>'

@app.route("/api/bookings/with-notes", methods=["GET"])
@token_required
def get_bookings_with_notes(current_user):
    bookings = Booking.query.filter_by(user_id=current_user.id).filter(Booking.notes_filename.isnot(None)).order_by(desc(Booking.scheduled_time)).all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/api/bookings/with-followups", methods=["GET"])
@token_required
def get_bookings_with_followups(current_user):
    bookings = Booking.query.filter_by(user_id=current_user.id).filter(Booking.followup_filename.isnot(None)).order_by(desc(Booking.scheduled_time)).all()
    return jsonify([b.to_dict() for b in bookings])

@app.route("/api/admin/unassign-slot/<int:slot_id>", methods=["POST"])
@admin_required
def unassign_slot(current_user, slot_id):
    slot = AvailableSlot.query.get_or_404(slot_id)
    if not slot.booked or not slot.booking:
        return jsonify({"error": "Slot is not currently booked"}), 400

    booking = slot.booking
    if booking.zoom_meeting_id:
        try:
            delete_zoom_meeting(booking.zoom_meeting_id)
        except Exception as e:
            print(f"⚠️ Failed to delete Zoom meeting: {e}")
    
    db.session.delete(booking)
    slot.booked = False
    db.session.commit()

    return jsonify({"message": "Slot unassigned and booking deleted"})

@app.route("/api/admin/generate-followup/<int:booking_id>", methods=["POST"])
@admin_required
def regenerate_followup(current_user, booking_id):
    booking = Booking.query.get_or_404(booking_id)
    if not booking.notes_filename:
        return jsonify({"error": "No notes file available for this booking"}), 400

    try:
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], booking.notes_filename)
        latex_text = extract_latex_from_pdf(file_path)
        followup_latex = generate_followup_questions_latex(latex_text)
        followup_filename = secure_filename(f"{booking_id}_{uuid.uuid4().hex[:8]}_regenerated.pdf")
        followup_path = os.path.join(UPLOAD_FOLDER, followup_filename)
        render_latex_to_pdf(followup_latex, followup_path)
        booking.followup_filename = followup_filename
        db.session.commit()
        return jsonify({"message": "Follow-up regenerated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/admin/topics", methods=["GET"])
@admin_required
def get_topics(current_user):
    topics = Topic.query.all()
    return jsonify([{"id": t.id, "name": t.name, "category": t.category, "weight": t.weight} for t in topics])


@app.route("/api/admin/topics", methods=["POST"])
@admin_required
def add_topic(current_user):
    data = request.json
    topic = Topic(name=data["name"], category=data.get("category"), weight=data.get("weight", 1.0))
    db.session.add(topic)
    db.session.commit()
    return jsonify({"id": topic.id}), 201


@app.route("/api/admin/topics/<int:id>", methods=["DELETE"])
@admin_required
def delete_topic(current_user, id):
    topic = Topic.query.get_or_404(id)
    logging.info(f"🗑️ Admin attempting to delete Topic ID {id} ('{topic.name}')")

    # 1. Delete Weekly Plan Entries related to this topic
    plan_entries = WeeklyPlanEntry.query.filter_by(topic_id=topic.id).all()
    if plan_entries:
        entry_ids = [entry.id for entry in plan_entries]
        logging.info(f"🧹 Found related WeeklyPlanEntry IDs: {entry_ids}")
        
        # 1a. Delete associated WeeklyPlanSubtopics first
        num_subtopics = WeeklyPlanSubtopic.query.filter(WeeklyPlanSubtopic.entry_id.in_(entry_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_subtopics} related WeeklyPlanSubtopics")

        # 1b. Delete the WeeklyPlanEntries themselves
        num_entries = WeeklyPlanEntry.query.filter(WeeklyPlanEntry.id.in_(entry_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_entries} related WeeklyPlanEntries")
    else:
        logging.info("🧹 No related WeeklyPlanEntries found.")

    # 2. Delete Questions related to this topic (and their dependents)
    questions = TopicQuestion.query.filter_by(topic_id=topic.id).all()
    if questions:
        question_ids = [q.id for q in questions]
        logging.info(f"🧹 Found related TopicQuestion IDs: {question_ids}")
        
        # 2a. Delete associated Rubrics (ConfidenceDescriptor)
        num_rubrics = ConfidenceDescriptor.query.filter(ConfidenceDescriptor.question_id.in_(question_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_rubrics} related ConfidenceDescriptors (Rubrics)")

        # 2b. Delete associated Assessments (TopicAssessment)
        num_assessments = TopicAssessment.query.filter(TopicAssessment.question_id.in_(question_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_assessments} related TopicAssessments")
        
        # 2c. Delete associated WeeklyPlanSubtopics (if any survived plan deletion - defensive check)
        num_subtopics_q = WeeklyPlanSubtopic.query.filter(WeeklyPlanSubtopic.question_id.in_(question_ids)).delete(synchronize_session=False)
        if num_subtopics_q > 0:
             logging.info(f"🧹 Deleted {num_subtopics_q} WeeklyPlanSubtopics linked directly to questions (defensive cleanup)")

        # 2d. Delete the Questions themselves
        num_questions = TopicQuestion.query.filter(TopicQuestion.id.in_(question_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_questions} related TopicQuestions")
    else:
         logging.info("🧹 No related TopicQuestions found.")

    # 3. Delete the Topic itself
    db.session.delete(topic)
    logging.info(f"🧹 Deleting Topic ID {id}")
    
    db.session.commit()
    logging.info(f"✅ Topic deletion complete for ID {id}")
    return jsonify({"message": "Topic and all related data deleted successfully"})

@app.route("/api/admin/questions", methods=["POST"])
@admin_required
def add_question(current_user):
    data = request.json
    question = TopicQuestion(
        topic_id=data["topic_id"],
        title=data["title"],
        tier=data["tier"],
        weight=data.get("weight", 1.0)
    )
    db.session.add(question)
    db.session.commit()
    return jsonify({"id": question.id}), 201


@app.route("/api/admin/questions/<int:id>", methods=["PUT"])
@admin_required
def edit_question(current_user, id):
    question = TopicQuestion.query.get_or_404(id)
    data = request.json
    question.title = data.get("title", question.title)
    question.tier = data.get("tier", question.tier)
    question.weight = data.get("weight", question.weight)
    db.session.commit()
    return jsonify({"message": "Question updated"})


@app.route("/api/admin/questions/<int:id>", methods=["DELETE"])
@admin_required
def delete_question(current_user, id):
    question = TopicQuestion.query.get_or_404(id)

    # Delete associated rubrics
    ConfidenceDescriptor.query.filter_by(question_id=question.id).delete()

    # Delete any topic assessments linked to this question
    TopicAssessment.query.filter_by(question_id=question.id).delete()

    # ✅ Delete subtopics that reference this question
    WeeklyPlanSubtopic.query.filter_by(question_id=question.id).delete()

    db.session.delete(question)
    db.session.commit()
    return jsonify({"message": "Question, rubrics, assessments, and plan subtopics deleted"})


@app.route("/api/admin/questions", methods=["GET"])
@admin_required
def get_questions(current_user):
    topic_id = request.args.get("topic_id")
    tier_param = request.args.get("tier")  # Accepts "F" or "H"
    
    query = TopicQuestion.query

    if topic_id:
        query = query.filter_by(topic_id=topic_id)

    if tier_param:
        if tier_param == "F":
            query = query.filter(TopicQuestion.tier == "Foundation")
        elif tier_param == "H":
            query = query.filter(TopicQuestion.tier == "Higher")

    questions = query.all()
    return jsonify([
        {
            "id": q.id,
            "title": q.title,
            "tier": q.tier,
            "weight": q.weight,
            "topic_id": q.topic_id
        } for q in questions
    ])

@app.route("/api/admin/questions/<int:question_id>/rubrics", methods=["GET"])
@admin_required
def get_rubrics(current_user, question_id):
    rubrics = ConfidenceDescriptor.query.filter_by(question_id=question_id).all()
    return jsonify([
        {"id": r.id, "score": r.score, "description": r.description}
        for r in rubrics
    ])


@app.route("/api/admin/rubrics", methods=["POST"])
@admin_required
def add_rubric(current_user):
    data = request.json
    rubric = ConfidenceDescriptor(
        question_id=data["question_id"],
        score=data["score"],
        description=data["description"]
    )
    db.session.add(rubric)
    db.session.commit()
    return jsonify({"id": rubric.id}), 201


@app.route("/api/admin/rubrics/<int:id>", methods=["PUT"])
@admin_required
def edit_rubric(current_user, id):
    rubric = ConfidenceDescriptor.query.get_or_404(id)
    data = request.json
    rubric.score = data.get("score", rubric.score)
    rubric.description = data.get("description", rubric.description)
    db.session.commit()
    return jsonify({"message": "Rubric updated"})


@app.route("/api/admin/rubrics/<int:id>", methods=["DELETE"])
@admin_required
def delete_rubric(current_user, id):
    rubric = ConfidenceDescriptor.query.get_or_404(id)
    db.session.delete(rubric)
    db.session.commit()
    return jsonify({"message": "Rubric deleted"})

@app.route("/api/quiz/submit", methods=["POST"])
@token_required
def submit_quiz(current_user):
    data = request.json  # [{question_id, confidence_score}]

    assessment = SelfAssessment(user_id=current_user.id)
    db.session.add(assessment)
    db.session.flush()  # Get assessment.id before commit

    for entry in data:
        question_id = entry["question_id"]
        confidence_score = entry["confidence_score"]

        question = TopicQuestion.query.get_or_404(question_id)
        topic_assessment = TopicAssessment(
            assessment_id=assessment.id,
            question_id=question.id,
            confidence_score=confidence_score
        )
        db.session.add(topic_assessment)

    db.session.commit()
    return jsonify({"message": "Assessment submitted"})

@app.route("/api/quiz/topics", methods=["GET"])
@token_required
def quiz_get_topics(current_user):
    use_user_paper = request.args.get("use_user_paper", "false").lower() == "true"

    if not use_user_paper or not current_user.maths_paper:
        # Default behavior or error if paper isn't set/requested
        topics = Topic.query.all()
        logging.warning("Quiz topics: Not using user paper or paper not set. Returning all topics.")
    else:
        user_paper = current_user.maths_paper
        logging.info(f"Quiz topics: Fetching for user paper '{user_paper}'")
        
        if user_paper == 'F':
            # Foundation users only get topics with at least one 'F' question
            query = Topic.query.join(Topic.questions).filter(TopicQuestion.tier == 'F').distinct()
            logging.info("  -> Filtering for topics containing Foundation questions only.")
        else: # user_paper == 'H'
            # Higher users get topics with at least one 'F' OR 'H' question (effectively all topics with any questions)
            query = Topic.query.join(Topic.questions).distinct()
            logging.info("  -> Including topics containing Foundation OR Higher questions.")
            
        topics = query.all()

    logging.info(f"📦 Returning {len(topics)} topics for quiz")
    return jsonify([
        {"id": t.id, "name": t.name, "category": t.category}
        for t in topics
    ])

@app.route("/api/quiz/questions", methods=["GET"])
@token_required
def quiz_get_questions(current_user):
    topic_id = request.args.get("topic_id")
    if not topic_id:
        return jsonify({"error": "Missing topic_id"}), 400

    use_user_paper = request.args.get("use_user_paper", "false").lower() == "true"
    logging.info(f"Quiz questions: Fetching for topic {topic_id}, use_user_paper={use_user_paper}")

    query = TopicQuestion.query.filter_by(topic_id=topic_id)

    if use_user_paper and current_user.maths_paper:
        user_paper = current_user.maths_paper
        logging.info(f"  -> Filtering based on user paper: {user_paper}")
        if user_paper == 'F':
            # Foundation users get only Foundation questions
            query = query.filter(TopicQuestion.tier == 'F')
            logging.info("    -> Applying filter: tier == 'F'")
        else: # user_paper == 'H'
            # Higher users get Foundation AND Higher questions
            query = query.filter(TopicQuestion.tier.in_(['F', 'H']))
            logging.info("    -> Applying filter: tier IN ('F', 'H')")
    else:
        logging.warning("  -> Not filtering by tier (no user paper or not requested).")
        # Optionally return no questions or all questions if paper isn't specified?
        # Current behaviour returns all questions for the topic.

    questions = query.all()
    logging.info(f"  -> Returning {len(questions)} questions for topic {topic_id}")
    return jsonify([
        {
            "id": q.id,
            "title": q.title,
            "tier": q.tier,
            "weight": q.weight
        } for q in questions
    ])

@app.route("/api/quiz/questions/<int:question_id>/rubrics", methods=["GET"])
@token_required
def quiz_get_rubrics(current_user, question_id):
    rubrics = ConfidenceDescriptor.query.filter_by(question_id=question_id).all()
    return jsonify([
        {"score": r.score, "description": r.description}
        for r in rubrics
    ])

def calculate_topic_priorities(user_id):
    from collections import defaultdict

    user = User.query.get_or_404(user_id)
    logging.info(f"🧠 Calculating priorities for user {user_id} (Paper: {user.maths_paper})")
    if not user.maths_paper:
        logging.warning(f"⚠️ User {user_id} has no maths paper set. Cannot calculate priorities.")
        return []

    # Determine which tiers to include based on user's paper
    include_foundation = True # Higher includes Foundation
    include_higher = (user.maths_paper == 'H')
    logging.info(f"🏷️ Including tiers: Foundation={include_foundation}, Higher={include_higher}")

    assessments = TopicAssessment.query.join(SelfAssessment).filter(
        SelfAssessment.user_id == user_id
    ).all()
    logging.info(f"📊 Found {len(assessments)} total assessment entries for user {user_id}")

    topic_data = defaultdict(lambda: {
        "weighted_sum": 0.0,
        "total_weight": 0.0,
        "subtopics": [],
        "topic_name": "",
        "category": "",
        "topic_weight": 1.0
    })

    for ta in assessments:
        question = ta.question
        topic = question.topic
        logging.debug(f"  - Considering Question ID {question.id} ('{question.title}', Tier: {question.tier}) for Topic ID {topic.id} ('{topic.name}')")

        # ⛔ Skip if question tier is not included based on user's paper
        is_foundation = (question.tier == 'F')
        is_higher = (question.tier == 'H')

        if not ((is_foundation and include_foundation) or (is_higher and include_higher)):
            logging.debug(f"    -> Skipping Question ID {question.id} - Tier {question.tier} not included for paper {user.maths_paper}")
            continue
        logging.debug(f"    -> Including Question ID {question.id} - Tier match for paper {user.maths_paper}")

        confidence = ta.confidence_score
        weight = question.weight

        topic_data[topic.id]["topic_name"] = topic.name
        topic_data[topic.id]["category"] = topic.category
        topic_data[topic.id]["weighted_sum"] += confidence * weight
        topic_data[topic.id]["total_weight"] += weight
        topic_data[topic.id]["topic_weight"] = topic.weight or 1.0

        topic_data[topic.id]["subtopics"].append({
            "question_id": question.id,
            "title": question.title,
            "confidence": confidence,
            "weight": weight
        })

    topic_priorities = []
    logging.info(f"⚙️ Processing {len(topic_data)} topics after initial assessment aggregation")

    for topic_id, data in topic_data.items():
        if not data["subtopics"]:
            logging.info(f"  -> Skipping Topic ID {topic_id} ('{data['topic_name']}') - No relevant subtopics after tier filtering")
            continue

        # Log the raw subtopics list for this topic before sorting
        if topic_id == 8: # Specific log for Topic 8
            logging.debug(f"    Raw subtopics for Topic 8 before sort: {data['subtopics']}")

        avg_score = data["weighted_sum"] / data["total_weight"] if data["total_weight"] else 0
        priority = (1 - avg_score / 5) * data["topic_weight"]
        logging.info(f"  -> Topic ID {topic_id} ('{data['topic_name']}'): Avg Score={avg_score:.2f}, Weight={data['topic_weight']:.2f}, Priority={priority:.4f}")

        # Sort subtopics by lowest confidence, then highest weight
        sorted_subtopics = sorted(data["subtopics"], key=lambda x: (x["confidence"], -x["weight"]))
        
        # Log the sorted subtopics list
        if topic_id == 8: # Specific log for Topic 8
             logging.debug(f"    Sorted subtopics for Topic 8 after sort: {sorted_subtopics}")

        focus_area = sorted_subtopics[0]["title"] if sorted_subtopics else None
        # logging.debug(f"    Sorted subtopics for Topic {topic_id}: {[(s['question_id'], s['confidence']) for s in sorted_subtopics]}") # Keep original debug log too

        topic_priorities.append({
            "topic_id": topic_id,
            "topic_name": data["topic_name"],
            "category": data["category"],
            "avg_score": round(avg_score, 2),
            "weight": data["topic_weight"],
            "priority": round(priority, 4),
            "focus_area": focus_area,
            "subtopics": sorted_subtopics
        })

    topic_priorities.sort(key=lambda x: x["priority"], reverse=True)
    logging.info(f"🏆 Final calculated priorities ({len(topic_priorities)} topics): {[(p['topic_id'], p['priority']) for p in topic_priorities]}")
    return topic_priorities

def generate_plan_for_user(user):
    if not user.exam_date or not user.target_grade:
        return jsonify({"error": "User must have an exam date and target grade set"}), 400

    from datetime import date

    # Delete all existing plans and related records for this user
    existing_plans = WeeklyPlan.query.filter_by(user_id=user.id).all()
    if existing_plans:
        plan_ids = [plan.id for plan in existing_plans]
        entry_ids = [entry.id for entry in WeeklyPlanEntry.query.filter(WeeklyPlanEntry.plan_id.in_(plan_ids)).all()]
        if entry_ids:
            WeeklyPlanSubtopic.query.filter(WeeklyPlanSubtopic.entry_id.in_(entry_ids)).delete(synchronize_session=False)
        WeeklyPlanEntry.query.filter(WeeklyPlanEntry.plan_id.in_(plan_ids)).delete(synchronize_session=False)
        WeeklyPlan.query.filter(WeeklyPlan.id.in_(plan_ids)).delete(synchronize_session=False)
        db.session.commit()
        logging.info(f"🧹 Cleared existing plan for user {user.id}")

    today = date.today()
    # Ensure exam_date is date object if it's datetime
    exam_date_obj = user.exam_date
    if isinstance(exam_date_obj, datetime):
        exam_date_obj = exam_date_obj.date()
        
    days_left = (exam_date_obj - today).days
    weeks_left = max(days_left // 7, 1)  # Ensure at least 1 week
    logging.info(f"📅 Generating plan for user {user.id} ({user.email}) over {weeks_left} weeks until {exam_date_obj}")

    # 1. Calculate and sort topic priorities
    priorities = calculate_topic_priorities(user.id)
    if not priorities:
        logging.warning(f"⚠️ No priorities calculated for user {user.id}. Cannot generate plan.")
        return jsonify({"error": "No assessment data found for user or priorities could not be calculated"}), 400

    # Prepare user_info dict for OpenAI helper
    user_info = {
        "target_grade": user.target_grade,
        "exam_date": user.exam_date, # Pass the original datetime or date object
    }

    # 2. Call OpenAI to generate the plan structure
    logging.info(f"🧠 Requesting plan generation from OpenAI for user {user.id}...")
    openai_plan_data = generate_weekly_plan_openai(user_info, priorities, weeks_left)

    if not openai_plan_data or "weekly_plan" not in openai_plan_data:
        logging.error(f"❌ Failed to generate plan using OpenAI for user {user.id}. OpenAI helper returned invalid data.")
        # Optional: Fallback to linear assignment? Or just return error.
        # For now, return error:
        return jsonify({"error": "Failed to generate plan structure via AI assistant."}), 500

    ai_generated_plan = openai_plan_data["weekly_plan"] # This is the dict { "1": [...], "2": [...] }
    logging.info(f"✅ OpenAI returned plan structure for user {user.id}. Proceeding to save.")

    # 3. Create the new WeeklyPlan DB entry
    plan = WeeklyPlan(
        user_id=user.id,
        exam_date=user.exam_date, # Use the original date/datetime
        target_grade=str(user.target_grade),
        generated_at=datetime.utcnow()
    )
    db.session.add(plan)
    db.session.flush()  # Get plan.id before creating entries
    logging.info(f"Created WeeklyPlan DB record (ID: {plan.id}) for user {user.id}")

    # 4. Process the AI-generated plan and save DB entries
    all_topic_ids = {t.id for t in Topic.query.all()} # Get valid topic IDs once
    all_question_ids = {q.id for q in TopicQuestion.query.all()} # Get valid question IDs once
    
    for week_str, weekly_topics in ai_generated_plan.items():
        try:
            week_num = int(week_str)
            if not isinstance(weekly_topics, list):
                logging.warning(f"⚠️ Skipping week '{week_str}' for user {user.id}: invalid format (expected list).")
                continue
            
            logging.info(f"  Processing Week {week_num} for plan {plan.id}")

            for topic_info in weekly_topics:
                if not isinstance(topic_info, dict) or "topic_id" not in topic_info or "subtopic_ids" not in topic_info:
                    logging.warning(f"    ⚠️ Skipping invalid topic entry in week {week_num}: {topic_info}")
                    continue

                topic_id = topic_info["topic_id"]
                focus_area = topic_info.get("focus_area") # Optional
                subtopic_ids = topic_info["subtopic_ids"]

                # Validate topic_id
                if topic_id not in all_topic_ids:
                    logging.warning(f"    ⚠️ Skipping topic ID {topic_id} in week {week_num}: Topic not found in database.")
                    continue

                # Validate subtopic_ids format
                if not isinstance(subtopic_ids, list):
                     logging.warning(f"    ⚠️ Skipping topic ID {topic_id} in week {week_num}: subtopic_ids is not a list ({subtopic_ids}).")
                     continue
                
                valid_subtopic_ids = [sid for sid in subtopic_ids if isinstance(sid, int) and sid in all_question_ids]
                if len(valid_subtopic_ids) != len(subtopic_ids):
                     logging.warning(f"    ⚠️ Filtered invalid/unknown subtopic IDs for topic {topic_id} in week {week_num}. Original: {subtopic_ids}, Valid: {valid_subtopic_ids}")

                if not valid_subtopic_ids: # Don't create entry if no valid subtopics provided by AI
                    logging.warning(f"    ⚠️ No valid subtopics provided by AI for topic {topic_id} in week {week_num}. Skipping entry creation.")
                    continue

                # Create WeeklyPlanEntry
                entry = WeeklyPlanEntry(
                    plan_id=plan.id,
                    week_number=week_num,
                    topic_id=topic_id,
                    focus_area=focus_area,
                    completed=False
                )
                db.session.add(entry)
                db.session.flush()  # Get entry.id
                logging.info(f"    -> Created WeeklyPlanEntry (ID: {entry.id}) for Topic {topic_id} in Week {week_num}")

                # Create WeeklyPlanSubtopic entries - ENSURE UNIQUENESS
                added_subtopic_count = 0
                # Convert to set to remove duplicates before creating DB entries
                unique_valid_subtopic_ids = set(valid_subtopic_ids)
                
                for sub_id in unique_valid_subtopic_ids:
                    subtopic_entry = WeeklyPlanSubtopic(
                        entry_id=entry.id,
                        question_id=sub_id
                    )
                    db.session.add(subtopic_entry)
                    added_subtopic_count += 1
                
                if added_subtopic_count > 0:
                    logging.info(f"      -> Added {added_subtopic_count} UNIQUE WeeklyPlanSubtopic records for Entry {entry.id} (IDs: {unique_valid_subtopic_ids})")
                
        except ValueError:
            logging.warning(f"⚠️ Skipping invalid week number '{week_str}' in OpenAI response for user {user.id}.")
        except Exception as e:
            logging.error(f"❌ Unexpected error processing week '{week_str}' for user {user.id}: {e}", exc_info=True)
            # Optionally rollback this week's additions or the whole plan?
            # For now, log and continue to next week if possible.

    # 5. Commit all changes
    try:
        db.session.commit()
        logging.info(f"✅ Successfully generated and saved AI-powered weekly plan for user {user.id} (Plan ID: {plan.id})")
        return jsonify({"message": "Weekly plan generated successfully using AI assistant.", "plan_id": plan.id})
    except Exception as e:
        db.session.rollback()
        logging.error(f"❌ Failed to commit AI-generated plan for user {user.id} to database: {e}", exc_info=True)
        return jsonify({"error": "Failed to save the generated plan to the database."}), 500

@app.route("/api/plan/generate", methods=["POST"])
@token_required
def generate_plan(current_user):
    return generate_plan_for_user(current_user)

@app.route("/api/admin/plan/generate/<int:user_id>", methods=["POST"])
@admin_required
def admin_generate_plan(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return generate_plan_for_user(user)

def view_plan_for_user(user):
    plan = WeeklyPlan.query.filter_by(user_id=user.id).order_by(WeeklyPlan.generated_at.desc()).first()

    if not plan:
        return jsonify({"message": "No plan found"}), 404

    # Eager load necessary relationships
    entries = (
        WeeklyPlanEntry.query
        .filter_by(plan_id=plan.id)
        .options(
            joinedload(WeeklyPlanEntry.topic), # Load parent Topic
            joinedload(WeeklyPlanEntry.subtopics)
              .joinedload(WeeklyPlanSubtopic.question) # Load Question details via WeeklyPlanSubtopic
        )
        .order_by(WeeklyPlanEntry.week_number)
        .all()
    )

    weekly = {}
    for entry in entries:
        week = entry.week_number
        if week not in weekly:
            weekly[week] = []

        subtopic_details = [
            {
                "weekly_plan_subtopic_id": s.id, # <<< ADDED THIS ID
                "question_id": s.question.id, # Renamed from "id" for clarity
                "title": s.question.title,
                "tier": s.question.tier,
                "weight": s.question.weight
            }
            for s in entry.subtopics # s here is a WeeklyPlanSubtopic object
        ]

        weekly[week].append({
            "entry_id": entry.id, # Maybe useful on frontend?
            "topic_id": entry.topic.id,
            "topic_name": entry.topic.name,
            "category": entry.topic.category,
            "focus_area": entry.focus_area,
            "completed": entry.completed, # Pass completed status
            "subtopics": subtopic_details # Now includes the correct ID
        })

    return jsonify({
        "plan": {
            "plan_id": plan.id,
            "exam_date": plan.exam_date.strftime("%Y-%m-%d"),
            "target_grade": plan.target_grade,
            "generated_at": plan.generated_at.strftime("%Y-%m-%d %H:%M")
        },
        "weekly_plan": weekly
    })

@app.route("/api/plan/view", methods=["GET"])
@token_required
def view_current_plan(current_user):
    return view_plan_for_user(current_user)

@app.route("/api/admin/plan/view/<int:user_id>", methods=["GET"])
@admin_required
def admin_view_plan(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return view_plan_for_user(user)

@app.route("/api/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user_info(current_user, user_id):
    user = User.query.get_or_404(user_id)

    return jsonify({
        "id": user.id,
        "name": user.name,
        "surname": user.surname,
        "email": user.email,
        "target_grade": user.target_grade,
        "maths_paper": user.maths_paper,
        "exam_date": user.exam_date.strftime("%Y-%m-%d") if user.exam_date else None
    })    

@app.route("/api/admin/plan/delete/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user_plan(current_user, user_id):
    logging.info(f"🗑️ Admin requested deletion of plan for user {user_id}")
    user = User.query.get_or_404(user_id)
    
    existing_plans = WeeklyPlan.query.filter_by(user_id=user.id).all()
    if not existing_plans:
        logging.info(f"🤷 No plan found for user {user_id} to delete")
        return jsonify({"message": "No plan found for this user"}), 404

    plan_ids = [plan.id for plan in existing_plans]
    logging.info(f"🧹 Deleting plans with IDs: {plan_ids}")

    # Find all entry IDs associated with these plans
    entry_ids = [entry.id for entry in WeeklyPlanEntry.query.filter(WeeklyPlanEntry.plan_id.in_(plan_ids)).all()]
    logging.info(f"🧹 Found associated entry IDs: {entry_ids}")

    if entry_ids:
        # 1. Delete subtopics linked to these entries
        num_subtopics = WeeklyPlanSubtopic.query.filter(WeeklyPlanSubtopic.entry_id.in_(entry_ids)).delete(synchronize_session=False)
        logging.info(f"🧹 Deleted {num_subtopics} subtopics")

    # 2. Delete entries linked to these plans
    num_entries = WeeklyPlanEntry.query.filter(WeeklyPlanEntry.plan_id.in_(plan_ids)).delete(synchronize_session=False)
    logging.info(f"🧹 Deleted {num_entries} entries")

    # 3. Delete the plans themselves
    num_plans = WeeklyPlan.query.filter(WeeklyPlan.id.in_(plan_ids)).delete(synchronize_session=False)
    logging.info(f"🧹 Deleted {num_plans} plans")

    db.session.commit()
    logging.info(f"✅ Plan deletion complete for user {user_id}")
    return jsonify({"message": "Weekly plan deleted successfully"})

def start_payment_checker():
    def check_loop():
        while True:
            print("🔄 Running scheduled payment check...")
            try:
                with app.app_context():
                    update_paid_status_for_bookings()
                    logging.info("✅ Payment check complete")
            except Exception as e:
                logging.info(f"❌ Payment check failed: {e}")

            time.sleep(600)  # 600 seconds = 10 minutes

    thread = threading.Thread(target=check_loop, daemon=True)
    thread.start()


with app.app_context():
    print("🚀 Starting background payment checker...")
    start_payment_checker()

# Temporary Debug Route - List all questions
@app.route("/debug/list-all-questions")
# @admin_required # Temporarily removed for easy access
def debug_list_questions(): # Removed current_user argument
    questions = TopicQuestion.query.options(joinedload(TopicQuestion.topic)).order_by(TopicQuestion.topic_id, TopicQuestion.id).all()
    output = []
    for q in questions:
        output.append(
            f"QID: {q.id: <3} | Tier: {q.tier: <10} | Weight: {q.weight: <4} | Topic: {q.topic.id: <2} ({q.topic.name}) | Title: {q.title}"
        )
    return "<pre>" + "\n".join(output) + "</pre>"

@app.route("/api/plan/entry/<int:entry_id>/complete", methods=["POST"])
@token_required
def mark_plan_entry_complete(current_user, entry_id):
    """Marks a specific weekly plan entry as completed for the current user."""
    logging.info(f"User {current_user.id} attempting to mark plan entry {entry_id} as complete.")
    
    # Query the entry and ensure it belongs to the current user
    entry = WeeklyPlanEntry.query.join(WeeklyPlan).filter(
        WeeklyPlanEntry.id == entry_id,
        WeeklyPlan.user_id == current_user.id
    ).first()

    if not entry:
        logging.warning(f"Plan entry {entry_id} not found or does not belong to user {current_user.id}.")
        return jsonify({"error": "Plan entry not found or you do not have permission to modify it."}), 404

    if entry.completed:
        logging.info(f"Plan entry {entry_id} is already marked as complete.")
        return jsonify({"message": "Plan entry already marked as complete."}), 200 # Or 204 No Content

    entry.completed = True
    db.session.commit()
    logging.info(f"✅ Plan entry {entry_id} marked as complete for user {current_user.id}.")
    return jsonify({"message": "Plan entry marked as complete."})
