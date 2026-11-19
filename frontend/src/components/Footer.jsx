import { CalendarCheck, Mail, Phone, Clock, MapPin, ArrowUp } from 'lucide-react'

export default function Footer({ onNavigate }) {
  const handleScroll = (e, targetId) => {
    e.preventDefault()
    if (onNavigate) {
      onNavigate(targetId)
    } else {
      const element = document.getElementById(targetId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="contact" className="site-footer">
      <div className="section-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Column 1: Brand & About */}
          <div className="footer-col brand-col">
            <a href="#home" className="footer-brand" onClick={(e) => handleScroll(e, 'home')}>
              <div className="brand-icon-wrapper">
                <CalendarCheck className="brand-icon" size={22} />
              </div>
              <span className="brand-name">
                Appoint<span className="brand-accent">Ease</span>
              </span>
            </a>
            <p className="footer-description">
              A modern appointment booking platform connecting people with trusted healthcare, wellness, and lifestyle professionals anytime, anywhere.
            </p>
            <div className="platform-tag">
              <span className="pulse-indicator" />
              <span>Platform Status: Live & Operational</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={(e) => handleScroll(e, 'home')}>
                  Home
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Explore Services
                </a>
              </li>
              <li>
                <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="#why-us" onClick={(e) => handleScroll(e, 'why-us')}>
                  Why Choose Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Categories */}
          <div className="footer-col">
            <h4 className="footer-heading">Service Categories</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Doctors & Physicians
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Dentists & Oral Care
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Barbers & Grooming
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Personal Fitness Trainers
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Salon & Beauty
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScroll(e, 'services')}>
                  Physiotherapy & Rehab
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information (Placeholders) */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact Details</h4>
            <p className="contact-notice">Customer Support & Inquiries (Demo Placeholders):</p>
            <ul className="contact-list">
              <li className="contact-item">
                <Mail size={16} className="contact-icon" />
                <span>support@appointease.example.com</span>
              </li>
              <li className="contact-item">
                <Phone size={16} className="contact-icon" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li className="contact-item">
                <Clock size={16} className="contact-icon" />
                <span>Mon - Sat: 8:00 AM - 8:00 PM EST</span>
              </li>
              <li className="contact-item">
                <MapPin size={16} className="contact-icon" />
                <span>100 Innovation Way, Suite 400 (Demo Center)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; 2026 AppointEase Platform. All rights reserved. Built for seamless professional scheduling.
          </p>
          <div className="footer-bottom-actions">
            <button
              type="button"
              className="scroll-top-btn"
              onClick={scrollToTop}
              aria-label="Scroll to top of page"
            >
              <span>Back to Top</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
