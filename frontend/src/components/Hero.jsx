import { ArrowRight, Sparkles, CheckCircle2, Clock, Calendar, CalendarCheck, Star, ShieldCheck } from 'lucide-react'

export default function Hero({ onNavigate }) {
  const handleScroll = (targetId) => {
    if (onNavigate) {
      onNavigate(targetId)
    } else {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="home" className="hero-section">
      <div className="section-container hero-container">
        {/* Left Column: Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} className="hero-badge-icon" />
            <span>Smart Appointment Management Platform</span>
          </div>

          <h1 className="hero-title">
            Your Time Matters. <br />
            <span className="text-gradient">Book Appointments Smarter.</span>
          </h1>

          <p className="hero-description">
            Discover trusted professionals, compare services and book your appointments at a time that works best for you.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => handleScroll('services')}
            >
              <span>Explore Services</span>
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => handleScroll('how-it-works')}
            >
              <span>How It Works</span>
            </button>
          </div>

          {/* Social Proof / Trust Highlights */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <div className="trust-rating">
                <Star size={16} className="star-icon" fill="currentColor" />
                <span className="rating-score">4.9/5</span>
              </div>
              <span className="trust-label">Over 25,000+ Bookings</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <div className="trust-stat">
                <ShieldCheck size={18} className="shield-icon" />
                <span className="stat-value">500+</span>
              </div>
              <span className="trust-label">Verified Specialists</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <div className="trust-stat">
                <Clock size={18} className="clock-icon" />
                <span className="stat-value">24/7</span>
              </div>
              <span className="trust-label">Instant Confirmation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Illustration / Booking Mockup */}
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-card-wrapper">
            {/* Main Interactive Booking Card Mockup */}
            <div className="booking-mockup-card">
              {/* Doctor / Specialist Header */}
              <div className="mockup-header">
                <div className="mockup-avatar-wrapper">
                  <div className="mockup-avatar">
                    <span>DR</span>
                  </div>
                  <span className="status-indicator online" />
                </div>
                <div className="mockup-info">
                  <div className="mockup-name-row">
                    <h3 className="mockup-name">Dr. Sarah Bennett, MD</h3>
                    <span className="badge-verified">Verified</span>
                  </div>
                  <p className="mockup-specialty">Cardiology & Preventive Care</p>
                  <div className="mockup-rating">
                    <Star size={14} fill="#eab308" color="#eab308" />
                    <span>4.9 (184 reviews)</span>
                    <span className="rating-dot">•</span>
                    <span className="experience-tag">12 yrs exp</span>
                  </div>
                </div>
              </div>

              {/* Slot Picker Mockup */}
              <div className="mockup-body">
                <div className="mockup-date-row">
                  <Calendar size={16} className="text-primary" />
                  <span className="date-text">Available Slots — Tomorrow, Oct 24</span>
                </div>

                <div className="mockup-slots-grid">
                  <div className="slot-pill">09:30 AM</div>
                  <div className="slot-pill active">10:45 AM</div>
                  <div className="slot-pill">02:15 PM</div>
                  <div className="slot-pill">04:30 PM</div>
                </div>

                <div className="mockup-action-btn">
                  <CalendarCheck size={16} />
                  <span>Reserved Slot: 10:45 AM</span>
                </div>
              </div>
            </div>

            {/* Floating Floating Pill Badge 1: Confirmed */}
            <div className="floating-badge badge-top-right">
              <div className="floating-badge-icon success">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="floating-badge-title">Booking Confirmed</p>
                <p className="floating-badge-subtitle">Instant SMS & Email reminder sent</p>
              </div>
            </div>

            {/* Floating Pill Badge 2: Real-time Availability */}
            <div className="floating-badge badge-bottom-left">
              <div className="floating-badge-icon primary">
                <Clock size={18} />
              </div>
              <div>
                <p className="floating-badge-title">Zero Wait Times</p>
                <p className="floating-badge-subtitle">Direct calendar sync with providers</p>
              </div>
            </div>

            {/* Ambient Background Glow Effect */}
            <div className="ambient-glow glow-1" />
            <div className="ambient-glow glow-2" />
          </div>
        </div>
      </div>
    </section>
  )
}
