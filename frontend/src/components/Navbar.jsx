import { useState, useEffect } from 'react'
import { CalendarCheck, Menu, X, ArrowRight } from 'lucide-react'

export default function Navbar({ onNavigate, currentView }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (e, targetId) => {
    e.preventDefault()
    setMobileMenuOpen(false)
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
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <a
          href="#home"
          className="navbar-brand"
          onClick={(e) => handleLinkClick(e, 'home')}
          aria-label="AppointEase Home"
        >
          <div className="brand-icon-wrapper">
            <CalendarCheck className="brand-icon" size={24} />
          </div>
          <span className="brand-name">
            Appoint<span className="brand-accent">Ease</span>
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav" aria-label="Main Navigation">
          <a
            href="#home"
            className="nav-link"
            onClick={(e) => handleLinkClick(e, 'home')}
          >
            Home
          </a>
          <a
            href="#services"
            className="nav-link"
            onClick={(e) => handleLinkClick(e, 'services')}
          >
            Explore Services
          </a>
          <a
            href="#how-it-works"
            className="nav-link"
            onClick={(e) => handleLinkClick(e, 'how-it-works')}
          >
            How It Works
          </a>
          <a
            href="#manage-booking"
            className={`nav-link ${currentView === 'manage-booking' ? 'active' : ''}`}
            onClick={(e) => handleLinkClick(e, 'manage-booking')}
          >
            Manage Booking
          </a>
          <a
            href="#contact"
            className="nav-link"
            onClick={(e) => handleLinkClick(e, 'contact')}
          >
            Contact
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="navbar-cta-group desktop-cta">
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => handleLinkClick(e, 'services')}
          >
            <span>Book Appointment</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu" role="dialog" aria-label="Mobile Navigation">
          <nav className="mobile-nav-links">
            <a
              href="#home"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, 'home')}
            >
              Home
            </a>
            <a
              href="#services"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, 'services')}
            >
              Explore Services
            </a>
            <a
              href="#how-it-works"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, 'how-it-works')}
            >
              How It Works
            </a>
            <a
              href="#manage-booking"
              className={`mobile-nav-link ${currentView === 'manage-booking' ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, 'manage-booking')}
            >
              Manage Booking
            </a>
            <a
              href="#contact"
              className="mobile-nav-link"
              onClick={(e) => handleLinkClick(e, 'contact')}
            >
              Contact
            </a>
            <div className="mobile-cta-wrapper">
              <button
                type="button"
                className="btn btn-primary btn-full"
                onClick={(e) => handleLinkClick(e, 'services')}
              >
                <span>Book Appointment</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
