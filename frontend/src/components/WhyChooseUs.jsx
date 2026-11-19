import { ShieldCheck, Clock, Zap, Tag } from 'lucide-react'

const ADVANTAGES = [
  {
    title: 'Trusted Professionals',
    description: 'Every specialist is verified with credential verification, license checks and real client reviews.',
    icon: ShieldCheck,
    badge: 'Verified Care'
  },
  {
    title: 'Flexible Appointment Slots',
    description: 'Morning, evening or weekend hours. Easily select or reschedule slots that align with your lifestyle.',
    icon: Clock,
    badge: '24/7 Access'
  },
  {
    title: 'Easy Booking Process',
    description: 'Zero complicated forms or waiting queues. Complete your booking in under 60 seconds with instant confirmation.',
    icon: Zap,
    badge: 'Under 1 Min'
  },
  {
    title: 'Transparent Pricing',
    description: 'No surprise consultation charges or hidden booking surcharges. See service pricing clearly before booking.',
    icon: Tag,
    badge: 'No Hidden Fees'
  }
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="why-us-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-eyebrow">Platform Benefits</span>
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">
            Designed to save your valuable time and provide peace of mind with every booking.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="why-grid">
          {ADVANTAGES.map((item) => {
            const IconComponent = item.icon
            return (
              <div key={item.title} className="why-card">
                <div className="why-card-top">
                  <div className="why-icon-box">
                    <IconComponent size={26} className="why-icon" />
                  </div>
                  <span className="why-badge">{item.badge}</span>
                </div>
                <h3 className="why-card-title">{item.title}</h3>
                <p className="why-card-description">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
