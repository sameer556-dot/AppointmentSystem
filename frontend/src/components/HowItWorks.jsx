import { Search, UserCheck, CalendarClock, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    stepNumber: '01',
    title: 'Choose a Service',
    description: 'Select the category that matches your needs from our curated directory of certified professionals.',
    icon: Search
  },
  {
    stepNumber: '02',
    title: 'Find a Professional',
    description: 'Explore providers, compare ratings, experience and prices to find the ideal expert for your care.',
    icon: UserCheck
  },
  {
    stepNumber: '03',
    title: 'Select Your Time',
    description: 'Check available appointment slots and choose a suitable time that integrates into your daily schedule.',
    icon: CalendarClock
  },
  {
    stepNumber: '04',
    title: 'Confirm Booking',
    description: 'Enter your details and receive your booking confirmation instantly with automatic calendar sync.',
    icon: CheckCircle2
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-eyebrow">Seamless Process</span>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Book your next appointment in four effortless steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.stepNumber} className="step-card">
                <div className="step-top-row">
                  <div className="step-icon-wrapper">
                    <IconComponent size={24} className="step-icon" />
                  </div>
                  <span className="step-number-tag">{step.stepNumber}</span>
                </div>

                <div className="step-content">
                  <h3 className="step-title">
                    <span className="step-prefix">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
