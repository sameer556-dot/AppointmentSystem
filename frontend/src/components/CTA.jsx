import { ArrowRight, CalendarCheck, ShieldCheck } from 'lucide-react'

export default function CTA({ onNavigate }) {
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
    <section className="cta-section">
      <div className="section-container">
        <div className="cta-banner">
          <div className="cta-content">
            <div className="cta-badge">
              <CalendarCheck size={16} />
              <span>Instant Scheduling</span>
            </div>

            <h2 className="cta-title">
              Ready to Book Your Next Appointment?
            </h2>

            <p className="cta-subtitle">
              Find the right professional and schedule your appointment in just a few simple steps.
            </p>

            <div className="cta-actions">
              <button
                type="button"
                className="btn btn-primary-light btn-lg"
                onClick={() => handleScroll('services')}
              >
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="cta-guarantees">
              <span className="guarantee-item">
                <ShieldCheck size={16} /> 100% Verified Specialists
              </span>
              <span className="guarantee-dot">•</span>
              <span className="guarantee-item">Free Rescheduling</span>
              <span className="guarantee-dot">•</span>
              <span className="guarantee-item">No Prepayment Required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
