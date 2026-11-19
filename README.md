# AppointEase — Digital Appointment Booking Platform

AppointEase is a modern, responsive, full-stack digital appointment booking web application built with **React 19 + Vite** on the frontend, **Python Flask 3** on the backend, and **SQLite with Flask-SQLAlchemy** for database persistence.

The platform provides a complete customer journey:
1. **Service Category Selection** (Doctors, Dentists, Barbers, Fitness Trainers, Salon & Beauty, Physiotherapists).
2. **India-Wide Location & Date Selection** (Interactive State & City selection across 36 major Indian cities, locality suggestions, and past date prevention).
3. **Provider Discovery, Search, Filtering & Real-Time Slot Availability** (Filter by practitioner name, specialization, fee range, minimum star rating, minimum experience, and **dynamic time availability** [Morning, Afternoon, Evening], plus 5 sorting options).
4. **Specialist Profile & Slot Reservation** (Weekly availability schedules, half-hour slots, past slot exclusion using Indian Standard Time [Asia/Kolkata], and database-level collision prevention).
5. **Customer Details & Booking Confirmation** (Validation for Indian mobile numbers, fee locking, unique `APT-YYYY-XXXXXXXX` reference IDs, and official printable appointment vouchers).
6. **Customer Self-Service Portal (Manage Booking & History)** (Lookup by mobile number, categorization into Upcoming, Past, and Cancelled visits, instant cancellation with slot re-availability, and data isolation).

---

## 1. Technology Stack

- **Frontend:**
  - React.js 19
  - Vite 8
  - CSS3 Design System with Custom Properties (responsive across mobile, tablet, laptop, and desktop)
  - Lucide React (Icons)
- **Backend:**
  - Python 3.10+
  - Flask 3.x
  - Flask-CORS
  - Flask-SQLAlchemy 3.x
  - Gunicorn (Linux Production WSGI Server)
  - Timezone handling: Asia/Kolkata (IST, UTC+05:30) via standard library `zoneinfo`
- **Database:**
  - SQLite 3 (Stored at `database/appointments.db`) with partial unique indexing (`WHERE status != 'Cancelled'`)
- **API Protocol:**
  - RESTful JSON APIs via browser Fetch API

---

## 2. Project Folder Structure

```text
Digital appointment web application/
├── backend/
│   ├── app.py                  # Main Flask application, API routes, and idempotent seeders
│   ├── config.py               # Environment configuration (Debug, CORS, Secret Key, DB URI)
│   ├── models.py               # SQLAlchemy models (Category, Provider, Availability, Appointment)
│   ├── data_locations.py       # India locations dataset & anti-leak location parameter parser
│   ├── sample_providers.py     # 180 demonstration providers across 36 Indian cities
│   ├── requirements.txt        # Python backend dependencies (includes gunicorn for Linux)
│   └── .env.example            # Template for backend environment variables
├── database/
│   └── appointments.db         # Persistent SQLite database file
├── frontend/
│   ├── public/
│   │   └── favicon.svg         # Application brand icon
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js          # Centralized, environment-aware API base URL configuration
│   │   ├── data/
│   │   │   └── indiaLocations.js # Nationwide 28 States, 8 UTs, major cities & localities
│   │   ├── components/         # All 14 React UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── WhyChooseUs.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LocationDateSelection.jsx
│   │   │   ├── ProviderDiscovery.jsx
│   │   │   ├── ProviderFilters.jsx
│   │   │   ├── ProviderDetails.jsx
│   │   │   ├── CustomerDetails.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   └── ManageBooking.jsx
│   │   ├── App.jsx             # Root workflow orchestrator and view routing
│   │   ├── index.css           # Global design system, components, and responsive media queries
│   │   └── main.jsx            # React/Vite entry point
│   ├── index.html              # HTML shell
│   ├── package.json            # Node.js dependencies and scripts
│   ├── vite.config.js          # Vite build config
│   └── .env.example            # Template for frontend environment variables
├── scratch/
│   ├── migrate_appointments_table.py # Archived SQLite partial unique index migration script
│   ├── verify_all.py           # Automated regression suite for filtering, slots, and bookings
│   └── verify_manage_booking.py # Automated regression suite for Manage Booking portal
└── README.md                   # Complete documentation and deployment guide
```

---

## 3. Local Development Setup

### Prerequisites
- **Python 3.10+**: [Download Python](https://www.python.org/downloads/)
- **Node.js (v18+)** and **npm**: [Download Node.js](https://nodejs.org/)

---

### Step 3.1: Backend Setup

Open a terminal and navigate to the `backend/` directory:

```bash
cd backend
```

1. **(Recommended) Create and activate a virtual environment:**
   - On Windows:
     ```cmd
     python -m venv venv
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

2. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the development server:**
   ```bash
   python app.py
   ```
   The Flask API will run at `http://localhost:5000`. On first run, it automatically initializes `database/appointments.db` with 6 categories and 199 verified demonstration providers across 36 Indian cities.

---

### Step 3.2: Frontend Setup

Open a second terminal and navigate to the `frontend/` directory:

```bash
cd frontend
```

1. **Install Node dependencies:**
   ```bash
   npm install
   ```

2. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 4. REST API Reference

All API responses return JSON format with standard HTTP status codes (`200`, `201`, `400`, `403`, `404`, `409`, `429`, `500`).

| Method | Endpoint | Query / Body Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | None | API health-check and heartbeat. |
| `GET` | `/api/categories` | None | Retrieves all 6 service categories. |
| `GET` | `/api/providers` | `category_id` (required), `city`, `state`, `location`, `date`, `time_filter` | Discovers providers strictly matching category and city with anti-leak protection. |
| `GET` | `/api/providers/<id>` | Provider ID (path) | Retrieves complete practitioner profile, bio, fees, and working hours. |
| `GET` | `/api/providers/<id>/slots` | `date` (`YYYY-MM-DD`, required) | Generates available slots for date. Excludes past slots (IST) and booked slots. |
| `POST` | `/api/bookings` | JSON: `provider_id`, `appointment_date`, `start_time`, `customer_name`, `customer_phone`, `customer_email` | Validates details and commits confirmed booking. Returns HTTP 409 on slot collision. |
| `GET` | `/api/bookings/<id>` | Booking ID (e.g. `APT-2026-XXXXXXXX`) | Retrieves confirmed appointment voucher details. |
| `GET` | `/api/bookings/history` | `phone` (query string, required) | Rate-limited (30 req/min) lookup of all bookings for a mobile number. |
| `PATCH`| `/api/bookings/<id>/cancel`| JSON: `{"phone": "9876543210"}` | Cancels upcoming confirmed appointment. Verifies ownership. Releases slot immediately. |

---

## 5. Production Deployment Guide

### 5.1 Backend Serverless Deployment (Vercel)

Deploy the Python Flask backend as a serverless project on **Vercel**:
1. In the Vercel Dashboard, click **Add New...** $\rightarrow$ **Project** and import your repository.
2. In the project settings, configure:
   - **Project Name:** `appointease-backend`
   - **Framework Preset:** `Other` (Vercel automatically detects the Python runtime via `requirements.txt`)
   - **Root Directory:** Click **Edit** and select `backend`
   - **Build Command:** *(leave empty / default)*
   - **Output Directory:** *(leave empty / default)*
   - **Install Command:** *(leave empty / Vercel automatically runs `pip install -r requirements.txt`)*
3. **Environment Variables:**
   - `DATABASE_URL`: Your Neon PostgreSQL pooled connection string (`postgresql://user:pass@ep-...pooler.region.aws.neon.tech/neondb?sslmode=require`)
   - `SECRET_KEY`: A strong 32-byte hex secret (`python -c "import secrets; print(secrets.token_hex(32))"`)
   - `CORS_ORIGINS`: `https://YOUR-FRONTEND-APP.vercel.app` (or `*` during setup; automatically supports `*.vercel.app` by default)
   - `TZ`: `Asia/Kolkata`
   - `FLASK_ENV`: `production`
   - `FLASK_DEBUG`: `false`
4. Click **Deploy**. Copy your deployed backend URL (e.g. `https://appointease-backend.vercel.app`).

---

### 5.2 Frontend Production Deployment (Vercel)

Deploy the React + Vite frontend as a second project on **Vercel**:
1. In the Vercel Dashboard, click **Add New...** $\rightarrow$ **Project** and import the same repository.
2. In the project settings, configure:
   - **Project Name:** `appointease-frontend`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. **Environment Variable:**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://YOUR-BACKEND-PROJECT.vercel.app/api` (your deployed Vercel backend URL with `/api` suffix)
4. Click **Deploy**.

---

### 5.3 Database Setup (Neon PostgreSQL)

1. Create a project in the [Neon Console](https://console.neon.tech/).
2. Copy the **Pooled Connection String** (ends with `-pooler...neon.tech/neondb?sslmode=require`).
3. To initialize the Neon database schema and seed the initial 6 categories and 199 providers before first use:
   ```bash
   # From your local repository root:
   DATABASE_URL="your-neon-pooled-connection-string" python scratch/migrate_appointments_table.py
   ```
   *(On Windows PowerShell, use `$env:DATABASE_URL="your-neon-pooled-connection-string"; python scratch/migrate_appointments_table.py`)*

---

### 5.4 Serverless Database & Architecture Notes

- **Serverless Execution:** The Flask backend runs on Vercel Serverless Functions (`@vercel/python`) via `backend/api/index.py` and `backend/vercel.json`. It does not rely on a long-running Gunicorn process.
- **Connection Reliability:** Serverless containers disconnect and reconnect frequently. The application utilizes Neon's connection pooler with `pool_pre_ping=True` and `pool_recycle=300` to prevent dropped connection errors.
- **Partial Unique Index:** Slot collisions and cancellation re-booking are enforced at the database engine level via `uq_provider_active_slot` with `WHERE status != 'Cancelled'`, which is fully compatible with Neon PostgreSQL.
- **Repository Safety:** Local SQLite database files (`database/*.db`) containing test customer appointments are excluded via `.gitignore` to protect personal information.

---

## 6. Architecture & Security Considerations

- **Slot Collisions:** Prevented at the database engine level via the partial unique index:
  ```sql
  CREATE UNIQUE INDEX uq_provider_active_slot 
  ON appointments(provider_id, appointment_date, start_time) 
  WHERE status != 'Cancelled';
  ```
  Simultaneous booking attempts on the same slot trigger an immediate transaction rollback with HTTP 409 Conflict.
- **Timezone Awareness:** All date and time calculations (past date detection, today's past slot exclusion, cancellation eligibility, and booking ID year generation) strictly use `Asia/Kolkata` (IST, UTC+05:30) via Python's standard library `zoneinfo`, ensuring consistent behavior regardless of host server location.
- **Phone Lookup Notice:** The current customer self-service portal uses mobile number lookup for lightweight access without requiring user account registration or passwords. For a public commercial platform handling sensitive medical records, it is recommended to integrate an SMS OTP provider (such as Twilio, MSG91, or Firebase Auth) before displaying appointment history or authorizing cancellations.

---

## 7. Running Automated Regression Tests

Two comprehensive test suites are preserved in `scratch/`:

```bash
# 1. Test Provider Filtering, Anti-leak, Slots, and Booking Transactions
python scratch/verify_all.py

# 2. Test Manage Booking, Phone Normalization, Isolation, and Cancellation
python scratch/verify_manage_booking.py
```
Both test suites run against the Flask test client and verify 100% of functional requirements.
