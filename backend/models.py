from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy

try:
    from zoneinfo import ZoneInfo
    IST_TZ = ZoneInfo('Asia/Kolkata')
except Exception:
    from datetime import timezone
    IST_TZ = timezone(timedelta(hours=5, minutes=30))

def get_current_ist_datetime():
    """Returns current datetime in Asia/Kolkata timezone (IST, UTC+05:30)."""
    return datetime.now(IST_TZ)

# Shared SQLAlchemy database instance
db = SQLAlchemy()


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon
        }

    def __repr__(self):
        return f'<Category {self.id}: {self.name}>'


class Provider(db.Model):
    __tablename__ = 'providers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    specialization = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False, default=5.0)
    total_reviews = db.Column(db.Integer, nullable=False, default=0)
    consultation_fee = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(100), nullable=False, default='Dehradun')
    state = db.Column(db.String(100), nullable=False, default='Uttarakhand')
    profile_image = db.Column(db.String(255), nullable=True)

    # Establish relationship to Category
    category = db.relationship('Category', backref=db.backref('providers', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'specialization': self.specialization,
            'description': self.description,
            'experience_years': self.experience_years,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'consultation_fee': self.consultation_fee,
            'location': self.location,
            'city': self.city,
            'state': getattr(self, 'state', 'Uttarakhand') or 'Uttarakhand',
            'profile_image': self.profile_image
        }

    def __repr__(self):
        return f'<Provider {self.id}: {self.name} ({self.specialization})>'


class ProviderAvailability(db.Model):
    __tablename__ = 'provider_availability'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    weekday = db.Column(db.Integer, nullable=False)  # 0=Monday, 1=Tuesday, ..., 6=Sunday
    start_time = db.Column(db.String(10), nullable=False)  # "HH:MM" 24-hr format e.g. "09:00"
    end_time = db.Column(db.String(10), nullable=False)    # "HH:MM" 24-hr format e.g. "17:00"
    slot_duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    # Establish relationship to Provider
    provider = db.relationship('Provider', backref=db.backref('availabilities', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'weekday': self.weekday,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'slot_duration_minutes': self.slot_duration_minutes,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<ProviderAvailability provider_id={self.provider_id} weekday={self.weekday} {self.start_time}-{self.end_time}>'


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id = db.Column(db.String(32), unique=True, nullable=False, index=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('providers.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    customer_name = db.Column(db.String(120), nullable=False)
    customer_phone = db.Column(db.String(25), nullable=False)
    customer_email = db.Column(db.String(120), nullable=True)
    appointment_date = db.Column(db.String(10), nullable=False)  # "YYYY-MM-DD"
    start_time = db.Column(db.String(10), nullable=False)        # "HH:MM" 24-hr format
    end_time = db.Column(db.String(10), nullable=False)          # "HH:MM" 24-hr format
    consultation_fee = db.Column(db.Integer, nullable=False)      # Price at time of booking
    status = db.Column(db.String(50), nullable=False, default='Confirmed')
    created_at = db.Column(db.DateTime, nullable=False, default=get_current_ist_datetime)

    # Unique index to guarantee no double bookings for an active slot, while allowing rebooking of cancelled slots
    __table_args__ = (
        db.Index(
            'uq_provider_active_slot',
            'provider_id',
            'appointment_date',
            'start_time',
            unique=True,
            sqlite_where=db.text("status != 'Cancelled'"),
            postgresql_where=db.text("status != 'Cancelled'")
        ),
    )

    # Relationships
    provider = db.relationship('Provider', backref=db.backref('appointments', lazy=True))
    category = db.relationship('Category', backref=db.backref('appointments', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'provider_id': self.provider_id,
            'provider_name': self.provider.name if self.provider else None,
            'provider_specialization': self.provider.specialization if self.provider else None,
            'provider_location': self.provider.location if self.provider else None,
            'provider_city': self.provider.city if self.provider else None,
            'provider_state': getattr(self.provider, 'state', 'Uttarakhand') if self.provider else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else (
                self.provider.category.name if self.provider and self.provider.category else None
            ),
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'customer_email': self.customer_email,
            'appointment_date': self.appointment_date,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'consultation_fee': self.consultation_fee,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

    def __repr__(self):
        return f'<Appointment {self.booking_id}: {self.customer_name} with Provider {self.provider_id} on {self.appointment_date} at {self.start_time}>'
