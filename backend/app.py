import os
import sys
import re
import uuid
import time as time_module
from datetime import datetime, time, timedelta

try:
    from zoneinfo import ZoneInfo
    IST_TZ = ZoneInfo('Asia/Kolkata')
except Exception:
    from datetime import timezone
    IST_TZ = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_datetime():
    """Returns current timezone-aware datetime in Asia/Kolkata (IST, UTC+05:30)."""
    return datetime.now(IST_TZ)

def get_current_ist_date():
    """Returns current date in Asia/Kolkata (IST)."""
    return get_current_ist_datetime().date()

def get_current_ist_time():
    """Returns current time in Asia/Kolkata (IST)."""
    return get_current_ist_datetime().time()

# Ensure backend directory is in sys.path if run directly
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError

try:
    from models import db, Category, Provider, ProviderAvailability, Appointment
    from config import Config, DATABASE_DIR
    from sample_providers import ADDITIONAL_PROVIDERS
    from data_locations import resolve_location_parameters
except ImportError:
    from backend.models import db, Category, Provider, ProviderAvailability, Appointment
    from backend.config import Config, DATABASE_DIR
    from backend.sample_providers import ADDITIONAL_PROVIDERS
    from backend.data_locations import resolve_location_parameters

# Ensure singleton module registration in sys.modules
if 'models' in sys.modules and 'backend.models' not in sys.modules:
    sys.modules['backend.models'] = sys.modules['models']
elif 'backend.models' in sys.modules and 'models' not in sys.modules:
    sys.modules['models'] = sys.modules['backend.models']

INITIAL_CATEGORIES = [
    {
        "name": "Doctor",
        "description": "Book appointments with qualified doctors and medical specialists",
        "icon": "stethoscope"
    },
    {
        "name": "Dentist",
        "description": "Professional dental checkups, cleaning, and oral healthcare treatments",
        "icon": "smile"
    },
    {
        "name": "Barber",
        "description": "Precision haircuts, beard trims, grooming, and classic styling",
        "icon": "scissors"
    },
    {
        "name": "Fitness Trainer",
        "description": "Personal workout training, strength coaching, and tailored fitness programs",
        "icon": "dumbbell"
    },
    {
        "name": "Salon & Beauty",
        "description": "Hair therapies, skincare rejuvenation, manicures, and spa treatments",
        "icon": "sparkles"
    },
    {
        "name": "Physiotherapist",
        "description": "Physical rehabilitation, injury recovery, posture therapy, and pain care",
        "icon": "activity"
    }
]

INITIAL_PROVIDERS = [
    # 1. Doctor
    {
        "name": "Dr. Sarah Bennett",
        "category_name": "Doctor",
        "specialization": "Cardiologist & General Physician",
        "description": "Board-certified physician with extensive experience in cardiovascular care, preventive cardiology, and general health screenings.",
        "experience_years": 12,
        "rating": 4.9,
        "total_reviews": 184,
        "consultation_fee": 600,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Rajesh Khanna",
        "category_name": "Doctor",
        "specialization": "General Medicine & Family Physician",
        "description": "Dedicated family physician specializing in chronic disease management, diabetes care, and routine adult health evaluations.",
        "experience_years": 15,
        "rating": 4.8,
        "total_reviews": 210,
        "consultation_fee": 500,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Ananya Sharma",
        "category_name": "Doctor",
        "specialization": "Pediatrician & Child Health Specialist",
        "description": "Compassionate pediatrician committed to newborn care, child development tracking, and pediatric immunizations.",
        "experience_years": 9,
        "rating": 4.9,
        "total_reviews": 142,
        "consultation_fee": 550,
        "location": "Ballupur",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Vikram Rawat",
        "category_name": "Doctor",
        "specialization": "Orthopedic & Joint Care Specialist",
        "description": "Specialized in joint replacement consultation, arthritis management, and minimally invasive bone care.",
        "experience_years": 11,
        "rating": 4.7,
        "total_reviews": 98,
        "consultation_fee": 700,
        "location": "Clock Tower",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },

    # 2. Dentist
    {
        "name": "Dr. Rohan Mehta",
        "category_name": "Dentist",
        "specialization": "Orthodontics & Cosmetic Dentistry",
        "description": "Expert in aesthetic smile makeovers, aligners, porcelain veneers, and complete dental restorations.",
        "experience_years": 10,
        "rating": 4.9,
        "total_reviews": 165,
        "consultation_fee": 500,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Priya Negi",
        "category_name": "Dentist",
        "specialization": "Preventive Dental & Endodontist",
        "description": "Gentle dentistry specialist focusing on painless root canals, teeth cleanings, and gum health preservation.",
        "experience_years": 8,
        "rating": 4.8,
        "total_reviews": 118,
        "consultation_fee": 450,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Amit Joshi",
        "category_name": "Dentist",
        "specialization": "Oral Surgery & Dental Implants",
        "description": "Senior dental surgeon with over a decade of expertise in wisdom teeth extractions and modern implantology.",
        "experience_years": 14,
        "rating": 4.7,
        "total_reviews": 130,
        "consultation_fee": 650,
        "location": "Ballupur",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },

    # 3. Barber
    {
        "name": "Marco Rossi",
        "category_name": "Barber",
        "specialization": "Master Hair Stylist & Beard Artisan",
        "description": "Premium classic haircuts, modern textured fades, and hot towel royal grooming experience.",
        "experience_years": 8,
        "rating": 4.8,
        "total_reviews": 220,
        "consultation_fee": 350,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Deepak Verma",
        "category_name": "Barber",
        "specialization": "Classic Barber & Grooming Consultant",
        "description": "Specialist in vintage hot towel shaves, scalp massages, and executive hair styling.",
        "experience_years": 12,
        "rating": 4.9,
        "total_reviews": 290,
        "consultation_fee": 300,
        "location": "Clock Tower",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Sameer Qureshi",
        "category_name": "Barber",
        "specialization": "Contemporary Fades & Beard Architecture",
        "description": "Modern urban grooming expert specializing in skin fades, beard lineups, and facial grooming therapies.",
        "experience_years": 6,
        "rating": 4.7,
        "total_reviews": 175,
        "consultation_fee": 400,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },

    # 4. Fitness Trainer
    {
        "name": "Aryan Thapa",
        "category_name": "Fitness Trainer",
        "specialization": "Strength & Functional Conditioning",
        "description": "Certified fitness coach helping clients achieve strength milestones, athletic conditioning, and injury prevention.",
        "experience_years": 8,
        "rating": 4.9,
        "total_reviews": 150,
        "consultation_fee": 800,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Meera Bisht",
        "category_name": "Fitness Trainer",
        "specialization": "Weight Loss & Calisthenics Coach",
        "description": "Holistic body transformation coach specializing in mobility drills, high-intensity fat loss, and custom meal planning.",
        "experience_years": 6,
        "rating": 4.8,
        "total_reviews": 120,
        "consultation_fee": 700,
        "location": "Ballupur",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Kabir Chauhan",
        "category_name": "Fitness Trainer",
        "specialization": "Hypertrophy & Sports Nutrition",
        "description": "Experienced powerlifting and physique trainer focusing on structured progressive overload and nutritional programming.",
        "experience_years": 10,
        "rating": 4.9,
        "total_reviews": 195,
        "consultation_fee": 900,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },

    # 5. Salon & Beauty
    {
        "name": "Natasha Kapoor",
        "category_name": "Salon & Beauty",
        "specialization": "Advanced Skincare & Bridal Glow Artistry",
        "description": "High-end cosmetologist specializing in oxygenating facials, bridal hair architecture, and rejuvenating organic cleanups.",
        "experience_years": 9,
        "rating": 4.9,
        "total_reviews": 210,
        "consultation_fee": 1200,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Sunita Bhatt",
        "category_name": "Salon & Beauty",
        "specialization": "Organic Hair Therapy & Ayurvedic Spa",
        "description": "Natural hair restoration expert offering scalp detox, herbal steam therapies, and restorative hair spa rituals.",
        "experience_years": 11,
        "rating": 4.8,
        "total_reviews": 160,
        "consultation_fee": 950,
        "location": "Sahastradhara Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Zoe D'Souza",
        "category_name": "Salon & Beauty",
        "specialization": "Aesthetic Facials & Gel Nail Artistry",
        "description": "Modern beauty practitioner offering micro-exfoliation treatments, gel manicure architecture, and brow design.",
        "experience_years": 7,
        "rating": 4.7,
        "total_reviews": 140,
        "consultation_fee": 850,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },

    # 6. Physiotherapist
    {
        "name": "Dr. Alok Nautiyal, MPT",
        "category_name": "Physiotherapist",
        "specialization": "Sports Injury Rehab & Posture Alignment",
        "description": "Consultant sports physiotherapist providing targeted joint mobilization, ligament recovery, and kinetic taping.",
        "experience_years": 11,
        "rating": 4.9,
        "total_reviews": 175,
        "consultation_fee": 700,
        "location": "Rajpur Road",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Sangeeta Pant, MPT",
        "category_name": "Physiotherapist",
        "specialization": "Neuro Rehabilitation & Geriatric Mobility",
        "description": "Compassionate therapist dedicated to neurological recovery, balance restoration, and chronic pain alleviation.",
        "experience_years": 9,
        "rating": 4.8,
        "total_reviews": 135,
        "consultation_fee": 650,
        "location": "Ballupur",
        "city": "Dehradun",
        "state": "Uttarakhand"
    },
    {
        "name": "Dr. Devendra Gusain, MPT",
        "category_name": "Physiotherapist",
        "specialization": "Spinal Ergonomics & Orthopedic Rehab",
        "description": "Specialized in spinal decompression, sciatica management, work-from-home posture correction, and manual therapy.",
        "experience_years": 13,
        "rating": 4.9,
        "total_reviews": 190,
        "consultation_fee": 750,
        "location": "Prem Nagar",
        "city": "Dehradun",
        "state": "Uttarakhand"
    }
]


def seed_categories():
    """Insert initial service categories only if they do not already exist."""
    try:
        inserted_count = 0
        for item in INITIAL_CATEGORIES:
            existing = Category.query.filter_by(name=item["name"]).first()
            if not existing:
                category = Category(
                    name=item["name"],
                    description=item["description"],
                    icon=item["icon"]
                )
                db.session.add(category)
                inserted_count += 1
        if inserted_count > 0:
            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error during category seeding: {e}")


def seed_providers():
    """Insert initial and expanded sample provider records across India idempotently."""
    try:
        inserted_count = 0
        all_providers_to_seed = INITIAL_PROVIDERS + ADDITIONAL_PROVIDERS
        for item in all_providers_to_seed:
            existing = Provider.query.filter_by(name=item["name"], city=item["city"]).first()
            if not existing:
                category = Category.query.filter_by(name=item["category_name"]).first()
                if category:
                    provider = Provider(
                        name=item["name"],
                        category_id=category.id,
                        specialization=item["specialization"],
                        description=item["description"],
                        experience_years=item["experience_years"],
                        rating=item["rating"],
                        total_reviews=item["total_reviews"],
                        consultation_fee=item["consultation_fee"],
                        location=item["location"],
                        city=item["city"],
                        state=item.get("state", "Uttarakhand"),
                        profile_image=None
                    )
                    db.session.add(provider)
                    inserted_count += 1
        if inserted_count > 0:
            db.session.commit()
            print(f"Successfully seeded {inserted_count} new providers into the database.")
    except Exception as e:
        db.session.rollback()
        print(f"Error during provider seeding: {e}")


def seed_availabilities():
    """Seed weekly availability schedules for providers idempotently."""
    try:
        providers = Provider.query.all()
        if not providers:
            return

        inserted_count = 0
        for provider in providers:
            # Check if this provider already has an availability schedule
            existing = ProviderAvailability.query.filter_by(provider_id=provider.id).first()
            if existing:
                continue

            category_name = provider.category.name if provider.category else ""

            # Vary schedule based on provider category
            if category_name == "Doctor":
                # Mon-Sat: 09:00 - 17:00, 30 min slots
                for wd in [0, 1, 2, 3, 4, 5]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="09:00",
                        end_time="17:00",
                        slot_duration_minutes=30,
                        is_active=True
                    ))
                    inserted_count += 1

            elif category_name == "Dentist":
                # Mon-Sat: 09:30 - 16:30, 30 min slots
                for wd in [0, 1, 2, 3, 4, 5]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="09:30",
                        end_time="16:30",
                        slot_duration_minutes=30,
                        is_active=True
                    ))
                    inserted_count += 1

            elif category_name == "Barber":
                # Mon-Sat: 10:00 - 19:00, 30 min slots
                for wd in [0, 1, 2, 3, 4, 5]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="10:00",
                        end_time="19:00",
                        slot_duration_minutes=30,
                        is_active=True
                    ))
                    inserted_count += 1

            elif category_name == "Fitness Trainer":
                # Mon-Fri: 07:00 - 15:00, Sat: 08:00 - 12:00, 60 min slots
                for wd in [0, 1, 2, 3, 4]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="07:00",
                        end_time="15:00",
                        slot_duration_minutes=60,
                        is_active=True
                    ))
                    inserted_count += 1
                db.session.add(ProviderAvailability(
                    provider_id=provider.id,
                    weekday=5,
                    start_time="08:00",
                    end_time="12:00",
                    slot_duration_minutes=60,
                    is_active=True
                ))
                inserted_count += 1

            elif category_name == "Salon & Beauty":
                # Mon-Sat: 10:00 - 18:00, 45 min slots
                for wd in [0, 1, 2, 3, 4, 5]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="10:00",
                        end_time="18:00",
                        slot_duration_minutes=45,
                        is_active=True
                    ))
                    inserted_count += 1

            elif category_name == "Physiotherapist":
                # Mon-Fri: 09:00 - 16:00, Sat: 09:00 - 13:00, 45 min slots
                for wd in [0, 1, 2, 3, 4]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="09:00",
                        end_time="16:00",
                        slot_duration_minutes=45,
                        is_active=True
                    ))
                    inserted_count += 1
                db.session.add(ProviderAvailability(
                    provider_id=provider.id,
                    weekday=5,
                    start_time="09:00",
                    end_time="13:00",
                    slot_duration_minutes=45,
                    is_active=True
                ))
                inserted_count += 1

            else:
                for wd in [0, 1, 2, 3, 4, 5]:
                    db.session.add(ProviderAvailability(
                        provider_id=provider.id,
                        weekday=wd,
                        start_time="09:00",
                        end_time="17:00",
                        slot_duration_minutes=30,
                        is_active=True
                    ))
                    inserted_count += 1

        if inserted_count > 0:
            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error during availability seeding: {e}")


def calculate_provider_available_slots(provider, req_date):
    """
    Calculate and return available appointment slots for a provider on a given date (datetime.date).
    Excludes past slots (if date is today) and already confirmed booked slots.
    Returns: (availability_record, list_of_available_slots)
    """
    weekday = req_date.weekday()
    availability = ProviderAvailability.query.filter_by(
        provider_id=provider.id,
        weekday=weekday,
        is_active=True
    ).first()

    if not availability:
        return availability, []

    start_h, start_m = map(int, availability.start_time.split(':'))
    end_h, end_m = map(int, availability.end_time.split(':'))
    slot_duration = availability.slot_duration_minutes

    now = get_current_ist_datetime()
    today = now.date()
    current_time = now.time()
    date_str = req_date.strftime('%Y-%m-%d')

    booked_slots = set(
        a.start_time for a in Appointment.query.filter_by(
            provider_id=provider.id,
            appointment_date=date_str,
            status='Confirmed'
        ).all()
    )

    current_slot_start = datetime.combine(req_date, time(start_h, start_m))
    schedule_end = datetime.combine(req_date, time(end_h, end_m))
    slot_delta = timedelta(minutes=slot_duration)

    slots = []
    while current_slot_start + slot_delta <= schedule_end:
        slot_end = current_slot_start + slot_delta
        slot_start_time = current_slot_start.time()
        slot_key = current_slot_start.strftime("%H:%M")

        is_past = False
        if req_date < today:
            is_past = True
        elif req_date == today and slot_start_time <= current_time:
            is_past = True

        is_booked = slot_key in booked_slots

        if not is_past and not is_booked:
            start_12 = current_slot_start.strftime("%I:%M %p")
            end_12 = slot_end.strftime("%I:%M %p")
            slots.append({
                "id": slot_key,
                "start_time": slot_key,
                "end_time": slot_end.strftime("%H:%M"),
                "start_time_formatted": start_12,
                "end_time_formatted": end_12,
                "label": start_12,
                "formatted": f"{start_12} - {end_12}"
            })

        current_slot_start = slot_end

    return availability, slots


def ensure_schema_compatibility():
    """Ensure database schema has required columns across both SQLite and PostgreSQL."""
    try:
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        if 'providers' in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns('providers')]
            if 'state' not in columns:
                with db.engine.connect() as conn:
                    conn.execute(db.text("ALTER TABLE providers ADD COLUMN state VARCHAR(100) DEFAULT 'Uttarakhand'"))
                    conn.execute(db.text("UPDATE providers SET state = 'Uttarakhand' WHERE state IS NULL OR state = ''"))
                    conn.commit()
            else:
                with db.engine.connect() as conn:
                    conn.execute(db.text("UPDATE providers SET state = 'Uttarakhand' WHERE state IS NULL OR state = ''"))
                    conn.commit()
    except Exception as e:
        print(f"Database schema compatibility check note: {e}")


def init_db(app=None):
    """Initializes database tables, columns, and seeds initial data idempotently."""
    target_app = app or create_app()
    with target_app.app_context():
        if DATABASE_DIR and target_app.config.get('SQLALCHEMY_DATABASE_URI', '').startswith('sqlite:'):
            os.makedirs(DATABASE_DIR, exist_ok=True)
        db.create_all()
        ensure_schema_compatibility()
        seed_categories()
        seed_providers()
        seed_availabilities()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for React frontend (supports explicit origins, wildcard, and Vercel domains)
    cors_origins = app.config.get('CORS_ORIGINS', [])
    if cors_origins:
        if cors_origins == ['*'] or '*' in cors_origins:
            CORS(app, resources={r"/*": {"origins": "*"}})
        else:
            CORS(app, resources={r"/*": {"origins": cors_origins}})
    else:
        CORS(app, resources={r"/*": {"origins": [r"^https://.*\.vercel\.app$", "http://localhost:5173", "http://127.0.0.1:5173"]}})

    # Initialize SQLAlchemy with app
    db.init_app(app)

    # Initialize database tables and seed initial data if not already initialized.
    # Checks table existence and records to avoid repeated slow seeding on every Gunicorn worker startup.
    with app.app_context():
        if DATABASE_DIR and app.config.get('SQLALCHEMY_DATABASE_URI', '').startswith('sqlite:'):
            os.makedirs(DATABASE_DIR, exist_ok=True)
        try:
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            table_names = inspector.get_table_names()
            if 'categories' not in table_names or 'providers' not in table_names:
                db.create_all()
                ensure_schema_compatibility()
                seed_categories()
                seed_providers()
                seed_availabilities()
            else:
                if Category.query.first() is None:
                    seed_categories()
                    seed_providers()
                    seed_availabilities()
                else:
                    ensure_schema_compatibility()
        except Exception as e:
            # Fallback for fresh database initialization
            try:
                db.create_all()
                ensure_schema_compatibility()
            except Exception:
                pass

    # CLI command for manual or scripted database initialization
    @app.cli.command("init-db")
    def init_db_command():
        """Initialize database tables and seed initial data."""
        init_db(app)
        print("Database initialized and seeded successfully.")

    # Root API index endpoint (for direct browser verification on Vercel)
    @app.route('/', methods=['GET'])
    def root_index():
        return jsonify({
            "status": "success",
            "message": "AppointEase API is running on Vercel Serverless",
            "health": "/api/health",
            "categories": "/api/categories",
            "providers": "/api/providers"
        }), 200

    # Health-check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "success",
            "message": "Appointment Booking API is running"
        }), 200

    # Service categories endpoint
    @app.route('/api/categories', methods=['GET'])
    def get_categories():
        try:
            categories = Category.query.order_by(Category.id.asc()).all()
            return jsonify({
                "status": "success",
                "categories": [c.to_dict() for c in categories]
            }), 200
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to fetch service categories",
                "error": str(e)
            }), 500

    # Provider discovery endpoint
    @app.route('/api/providers', methods=['GET'])
    def get_providers():
        try:
            category_id_param = request.args.get('category_id')
            state_param = request.args.get('state', '').strip()
            city_param = request.args.get('city', '').strip()
            location_param = request.args.get('location', '').strip()

            # Validate category_id presence
            if not category_id_param:
                return jsonify({
                    "status": "error",
                    "message": "category_id query parameter is required"
                }), 400

            # Validate category_id integer format
            try:
                category_id = int(category_id_param)
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": "category_id must be a valid integer"
                }), 400

            # Check if category exists
            category = Category.query.get(category_id)
            if not category:
                return jsonify({
                    "status": "error",
                    "message": f"Category with id {category_id} not found"
                }), 404

            # Query providers for this category
            query = Provider.query.filter_by(category_id=category_id)

            # Resolve target city, state, and locality
            target_city, target_state, target_locality = resolve_location_parameters(
                city_param, state_param, location_param
            )

            # 1. Primary Filter: City (Case-insensitive, exact trimmed match on provider's city)
            if target_city:
                clean_target_city = target_city.strip()
                if clean_target_city.lower() in ['delhi', 'new delhi']:
                    query = query.filter(
                        db.or_(
                            db.func.lower(db.func.trim(Provider.city)) == 'delhi',
                            db.func.lower(db.func.trim(Provider.city)) == 'new delhi'
                        )
                    )
                else:
                    query = query.filter(
                        db.func.lower(db.func.trim(Provider.city)) == clean_target_city.lower()
                    )

            # 2. State Filter if provided
            if target_state:
                clean_target_state = target_state.strip()
                query = query.filter(
                    db.func.lower(db.func.trim(Provider.state)) == clean_target_state.lower()
                )

            # 3. Locality Filter (Within the city, or fallback if only locality provided)
            if target_locality:
                clean_target_locality = target_locality.strip()
                query = query.filter(Provider.location.ilike(f"%{clean_target_locality}%"))

            providers = query.order_by(Provider.rating.desc(), Provider.total_reviews.desc()).all()

            # Filter by date and time slot availability if specified
            date_param = request.args.get('date', '').strip()
            time_filter_param = (
                request.args.get('time_filter', '') or 
                request.args.get('time_slot', '') or 
                request.args.get('time', '') or 
                request.args.get('available_time', '')
            ).strip().lower()

            if date_param and time_filter_param and time_filter_param != 'all':
                try:
                    req_date = datetime.strptime(date_param, '%Y-%m-%d').date()
                    matched_providers = []
                    for p in providers:
                        _, p_slots = calculate_provider_available_slots(p, req_date)
                        has_slot = False
                        for s in p_slots:
                            st = s['start_time']
                            if time_filter_param == 'morning' and '06:00' <= st < '12:00':
                                has_slot = True
                                break
                            elif time_filter_param == 'afternoon' and '12:00' <= st < '17:00':
                                has_slot = True
                                break
                            elif time_filter_param == 'evening' and '17:00' <= st < '22:00':
                                has_slot = True
                                break
                        if has_slot:
                            matched_providers.append(p)
                    providers = matched_providers
                except ValueError:
                    pass

            return jsonify({
                "status": "success",
                "count": len(providers),
                "category": {
                    "id": category.id,
                    "name": category.name
                },
                "providers": [p.to_dict() for p in providers]
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to fetch providers",
                "error": str(e)
            }), 500

    # Provider details endpoint
    @app.route('/api/providers/<int:provider_id>', methods=['GET'])
    def get_provider_details(provider_id):
        try:
            provider = Provider.query.get(provider_id)
            if not provider:
                return jsonify({
                    "status": "error",
                    "message": f"Provider with id {provider_id} not found"
                }), 404

            provider_dict = provider.to_dict()
            if provider.category:
                provider_dict['category'] = provider.category.to_dict()

            return jsonify({
                "status": "success",
                "provider": provider_dict
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to fetch provider details",
                "error": str(e)
            }), 500

    # Provider appointment time slots endpoint
    @app.route('/api/providers/<int:provider_id>/slots', methods=['GET'])
    def get_provider_slots(provider_id):
        try:
            # 1. Validate provider existence
            provider = Provider.query.get(provider_id)
            if not provider:
                return jsonify({
                    "status": "error",
                    "message": f"Provider with id {provider_id} not found"
                }), 404

            # 2. Validate requested date parameter
            date_param = request.args.get('date', '').strip()
            if not date_param:
                return jsonify({
                    "status": "error",
                    "message": "Missing 'date' query parameter. Expected YYYY-MM-DD format."
                }), 400

            try:
                req_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": f"Invalid date format '{date_param}'. Expected YYYY-MM-DD format."
                }), 400

            # 3. Determine weekday and day name (0=Monday, ..., 6=Sunday)
            weekday = req_date.weekday()
            day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_name = day_names[weekday]

            # 4. Query provider availability schedule & generate slots
            availability, slots = calculate_provider_available_slots(provider, req_date)

            if not availability:
                return jsonify({
                    "status": "success",
                    "provider_id": provider.id,
                    "provider_name": provider.name,
                    "date": date_param,
                    "day_name": day_name,
                    "is_available": False,
                    "message": f"{provider.name} is not available on {day_name}s.",
                    "total_slots": 0,
                    "slots": []
                }), 200

            return jsonify({
                "status": "success",
                "provider_id": provider.id,
                "provider_name": provider.name,
                "date": date_param,
                "day_name": day_name,
                "working_hours": f"{availability.start_time} - {availability.end_time}",
                "slot_duration_minutes": availability.slot_duration_minutes,
                "is_available": len(slots) > 0,
                "total_slots": len(slots),
                "slots": slots
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to generate appointment slots",
                "error": str(e)
            }), 500

    def generate_booking_id():
        """Generate a unique booking ID in the format APT-YYYY-XXXXXXXX."""
        year = get_current_ist_datetime().year
        for _ in range(10):
            suffix = uuid.uuid4().hex[:8].upper()
            candidate = f"APT-{year}-{suffix}"
            if not Appointment.query.filter_by(booking_id=candidate).first():
                return candidate
        return f"APT-{year}-{uuid.uuid4().hex[:12].upper()}"

    # Appointment booking submission endpoint
    @app.route('/api/bookings', methods=['POST'])
    def create_booking():
        try:
            data = request.get_json()
            if not data or not isinstance(data, dict):
                return jsonify({
                    "status": "error",
                    "message": "Invalid JSON request payload"
                }), 400

            # 1. Required fields check
            required_fields = ['provider_id', 'appointment_date', 'start_time', 'customer_name', 'customer_phone']
            for field in required_fields:
                val = data.get(field)
                if val is None or str(val).strip() == '':
                    return jsonify({
                        "status": "error",
                        "message": f"Missing required field: '{field}'"
                    }), 400

            # 2. Validate provider_id and existence
            try:
                provider_id = int(data.get('provider_id'))
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "provider_id must be a valid integer"
                }), 400

            provider = Provider.query.get(provider_id)
            if not provider:
                return jsonify({
                    "status": "error",
                    "message": f"Provider with id {provider_id} not found"
                }), 404

            # 3. Validate customer name
            customer_name = str(data.get('customer_name', '')).strip()
            if len(customer_name) < 2 or len(customer_name) > 100:
                return jsonify({
                    "status": "error",
                    "message": "Customer name must be between 2 and 100 characters"
                }), 400

            if not re.search(r'[a-zA-Z]', customer_name):
                return jsonify({
                    "status": "error",
                    "message": "Customer name must contain alphabetical characters"
                }), 400

            if re.search(r'[^a-zA-Z\s\.\'\-]', customer_name):
                return jsonify({
                    "status": "error",
                    "message": "Customer name contains invalid characters. Only letters, spaces, hyphens, and periods are permitted."
                }), 400

            # 4. Validate customer phone (Indian mobile number format)
            raw_phone = str(data.get('customer_phone', '')).strip()
            cleaned_phone = re.sub(r'[\s\-\(\)]', '', raw_phone)
            phone_match = re.match(r'^(?:\+91|91|0)?([6-9]\d{9})$', cleaned_phone)
            if not phone_match:
                return jsonify({
                    "status": "error",
                    "message": "Please provide a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)"
                }), 400
            normalized_phone = phone_match.group(1)

            # 5. Validate optional email
            raw_email = data.get('customer_email')
            normalized_email = None
            if raw_email is not None and str(raw_email).strip() != '':
                normalized_email = str(raw_email).strip().lower()
                email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
                if not re.match(email_regex, normalized_email):
                    return jsonify({
                        "status": "error",
                        "message": "Invalid email address format"
                    }), 400

            # 6. Validate appointment date
            date_str = str(data.get('appointment_date', '')).strip()
            try:
                appt_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": f"Invalid date format '{date_str}'. Expected YYYY-MM-DD format."
                }), 400

            today = get_current_ist_date()
            if appt_date < today:
                return jsonify({
                    "status": "error",
                    "message": "Appointment date cannot be in the past"
                }), 400

            # 7. Validate appointment start_time format
            time_str = str(data.get('start_time', '')).strip()
            try:
                start_t = datetime.strptime(time_str, '%H:%M').time()
            except ValueError:
                return jsonify({
                    "status": "error",
                    "message": f"Invalid start time format '{time_str}'. Expected HH:MM format."
                }), 400

            now_time = get_current_ist_time()
            if appt_date == today and start_t <= now_time:
                return jsonify({
                    "status": "error",
                    "message": "The selected appointment time has already passed for today"
                }), 400

            # 8. Verify slot belongs to provider's actual availability schedule
            weekday = appt_date.weekday()
            day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            day_name = day_names[weekday]

            availability = ProviderAvailability.query.filter_by(
                provider_id=provider.id,
                weekday=weekday,
                is_active=True
            ).first()

            if not availability:
                return jsonify({
                    "status": "error",
                    "message": f"{provider.name} is not available on {day_name}s"
                }), 400

            # Compute valid slot start/end times according to schedule
            start_h, start_m = map(int, availability.start_time.split(':'))
            end_h, end_m = map(int, availability.end_time.split(':'))
            slot_duration = availability.slot_duration_minutes

            curr_slot_dt = datetime.combine(appt_date, time(start_h, start_m))
            sched_end_dt = datetime.combine(appt_date, time(end_h, end_m))
            slot_delta = timedelta(minutes=slot_duration)

            valid_slots = {}
            while curr_slot_dt + slot_delta <= sched_end_dt:
                st_key = curr_slot_dt.strftime('%H:%M')
                et_key = (curr_slot_dt + slot_delta).strftime('%H:%M')
                valid_slots[st_key] = et_key
                curr_slot_dt += slot_delta

            if time_str not in valid_slots:
                return jsonify({
                    "status": "error",
                    "message": f"Time slot '{time_str}' does not belong to {provider.name}'s active schedule"
                }), 400

            calculated_end_time = valid_slots[time_str]

            # 9. Verify slot is not already booked (immediate pre-check)
            existing_booking = Appointment.query.filter_by(
                provider_id=provider.id,
                appointment_date=date_str,
                start_time=time_str,
                status='Confirmed'
            ).first()

            if existing_booking:
                return jsonify({
                    "status": "error",
                    "message": "This appointment slot has already been booked. Please choose another time slot."
                }), 409

            # 10. Generate booking ID & retrieve fee from DB
            booking_id = generate_booking_id()
            consultation_fee = provider.consultation_fee  # Stored directly from DB

            new_appointment = Appointment(
                booking_id=booking_id,
                provider_id=provider.id,
                category_id=provider.category_id,
                customer_name=customer_name,
                customer_phone=normalized_phone,
                customer_email=normalized_email,
                appointment_date=date_str,
                start_time=time_str,
                end_time=calculated_end_time,
                consultation_fee=consultation_fee,
                status='Confirmed'
            )

            try:
                db.session.add(new_appointment)
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                return jsonify({
                    "status": "error",
                    "message": "This appointment slot was just booked by another user. Please choose another time slot."
                }), 409
            except Exception as e:
                db.session.rollback()
                return jsonify({
                    "status": "error",
                    "message": "An unexpected error occurred while saving your appointment."
                }), 500

            return jsonify({
                "status": "success",
                "message": "Appointment booked successfully!",
                "booking": new_appointment.to_dict()
            }), 201

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to process booking request",
                "error": str(e)
            }), 500

    # In-memory rate limiting tracker for booking history lookups
    history_lookup_rate_limit = {}

    # Booking history lookup by customer phone number
    @app.route('/api/bookings/history', methods=['GET'])
    def get_booking_history():
        try:
            # 1. Basic rate limiting check (30 requests per minute per IP)
            client_ip = request.remote_addr or 'unknown'
            now_ts = time_module.time()
            timestamps = [ts for ts in history_lookup_rate_limit.get(client_ip, []) if now_ts - ts < 60]
            if len(timestamps) >= 30:
                history_lookup_rate_limit[client_ip] = timestamps
                return jsonify({
                    "status": "error",
                    "message": "Too many lookup requests. Please wait a minute and try again."
                }), 429
            timestamps.append(now_ts)
            history_lookup_rate_limit[client_ip] = timestamps

            # 2. Extract and validate phone parameter
            phone_param = request.args.get('phone', '').strip()
            if not phone_param:
                return jsonify({
                    "status": "error",
                    "message": "Phone number query parameter 'phone' is required."
                }), 400

            cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone_param)
            phone_match = re.match(r'^(?:\+91|91|0)?([6-9]\d{9})$', cleaned_phone)
            if not phone_match:
                return jsonify({
                    "status": "error",
                    "message": "Please provide a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)."
                }), 400

            normalized_phone = phone_match.group(1)

            # 3. Query bookings matching any common formatting of this phone number
            phone_variants = [
                normalized_phone,
                f"+91{normalized_phone}",
                f"91{normalized_phone}",
                f"0{normalized_phone}",
                f"+91 {normalized_phone}",
                f"+91-{normalized_phone}"
            ]

            appointments = Appointment.query.filter(
                Appointment.customer_phone.in_(phone_variants)
            ).order_by(
                Appointment.appointment_date.desc(),
                Appointment.start_time.desc()
            ).all()

            # 4. Process appointments into rich response with past/cancellable flags
            now = get_current_ist_datetime()
            today_str = now.strftime('%Y-%m-%d')
            now_time_str = now.strftime('%H:%M')

            booking_list = []
            for appt in appointments:
                item = appt.to_dict()
                is_past = (appt.appointment_date < today_str) or (
                    appt.appointment_date == today_str and appt.start_time <= now_time_str
                )
                item['is_past'] = is_past

                if appt.status.lower() == 'cancelled':
                    item['display_status'] = 'Cancelled'
                    item['is_cancellable'] = False
                elif is_past:
                    item['display_status'] = 'Past'
                    item['is_cancellable'] = False
                else:
                    item['display_status'] = 'Confirmed'
                    item['is_cancellable'] = True

                booking_list.append(item)

            return jsonify({
                "status": "success",
                "phone": normalized_phone,
                "count": len(booking_list),
                "bookings": booking_list,
                "message": f"Found {len(booking_list)} booking(s)." if booking_list else "No bookings found for this phone number."
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to retrieve booking history. Please try again later.",
                "error": str(e)
            }), 500

    # Cancel upcoming appointment endpoint
    @app.route('/api/bookings/<string:booking_id>/cancel', methods=['PATCH'])
    def cancel_booking(booking_id):
        try:
            clean_id = (booking_id or '').strip()
            if not clean_id:
                return jsonify({
                    "status": "error",
                    "message": "Booking ID is required."
                }), 400

            data = request.get_json(silent=True) or {}
            phone_input = str(data.get('phone', '')).strip()
            if not phone_input:
                return jsonify({
                    "status": "error",
                    "message": "Phone number is required to verify ownership before cancellation."
                }), 400

            cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone_input)
            phone_match = re.match(r'^(?:\+91|91|0)?([6-9]\d{9})$', cleaned_phone)
            if not phone_match:
                return jsonify({
                    "status": "error",
                    "message": "Please provide a valid 10-digit Indian mobile number."
                }), 400

            normalized_phone = phone_match.group(1)

            # Retrieve appointment
            appointment = Appointment.query.filter_by(booking_id=clean_id).first()
            if not appointment:
                return jsonify({
                    "status": "error",
                    "message": f"Appointment with booking ID '{clean_id}' was not found."
                }), 404

            # Verify ownership: check that customer_phone matches
            appt_cleaned_phone = re.sub(r'[\s\-\(\)]', '', appointment.customer_phone)
            appt_match = re.match(r'^(?:\+91|91|0)?([6-9]\d{9})$', appt_cleaned_phone)
            appt_norm_phone = appt_match.group(1) if appt_match else appt_cleaned_phone

            if appt_norm_phone != normalized_phone:
                return jsonify({
                    "status": "error",
                    "message": "Unauthorized. The provided phone number does not match this booking record."
                }), 403

            # Check if already cancelled
            if appointment.status.lower() == 'cancelled':
                return jsonify({
                    "status": "error",
                    "message": "This appointment has already been cancelled."
                }), 400

            # Check if appointment is in the past
            now = get_current_ist_datetime()
            today_str = now.strftime('%Y-%m-%d')
            now_time_str = now.strftime('%H:%M')
            is_past = (appointment.appointment_date < today_str) or (
                appointment.appointment_date == today_str and appointment.start_time <= now_time_str
            )
            if is_past:
                return jsonify({
                    "status": "error",
                    "message": "Past or completed appointments cannot be cancelled."
                }), 400

            # Execute cancellation
            appointment.status = 'Cancelled'
            db.session.commit()

            result = appointment.to_dict()
            result['is_past'] = False
            result['is_cancellable'] = False
            result['display_status'] = 'Cancelled'

            return jsonify({
                "status": "success",
                "message": "Appointment cancelled successfully.",
                "booking": result
            }), 200

        except Exception as e:
            db.session.rollback()
            return jsonify({
                "status": "error",
                "message": "An unexpected error occurred while processing the cancellation.",
                "error": str(e)
            }), 500

    # Fetch booking details by booking ID
    @app.route('/api/bookings/<string:booking_id>', methods=['GET'])
    def get_booking_details(booking_id):
        try:
            clean_id = booking_id.strip()
            appointment = Appointment.query.filter_by(booking_id=clean_id).first()
            if not appointment:
                return jsonify({
                    "status": "error",
                    "message": f"Appointment with booking ID '{clean_id}' not found"
                }), 404

            return jsonify({
                "status": "success",
                "booking": appointment.to_dict()
            }), 200

        except Exception as e:
            return jsonify({
                "status": "error",
                "message": "Failed to retrieve booking details",
                "error": str(e)
            }), 500

    return app


app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug_mode = app.config.get('DEBUG', False)
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
