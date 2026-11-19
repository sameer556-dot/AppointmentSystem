import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  Phone,
  Search,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CalendarX,
  X,
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  Sparkle,
  Info
} from 'lucide-react'

// Map backend icon string to Lucide component
const getCategoryIcon = (iconName) => {
  switch (iconName?.toLowerCase()) {
    case 'stethoscope':
    case 'doctor':
      return Stethoscope
    case 'smile':
    case 'dentist':
      return Smile
    case 'scissors':
    case 'barber':
      return Scissors
    case 'dumbbell':
    case 'fitness':
    case 'fitness trainer':
      return Dumbbell
    case 'sparkles':
    case 'salon':
    case 'beauty':
    case 'salon & beauty':
      return Sparkles
    case 'activity':
    case 'physiotherapy':
    case 'physiotherapist':
      return Activity
    default:
      return Sparkle
  }
}

// Format YYYY-MM-DD date for display
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Date not specified'
  const [year, month, day] = dateStr.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Format 24-hr HH:MM time into 12-hr AM/PM
const formatDisplayTime = (timeStr) => {
  if (!timeStr) return ''
  const [hourStr, minStr] = timeStr.split(':')
  const hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minStr} ${period}`
}

export default function ManageBooking({ onNavigateHome, onBookNew, initialPhone = '' }) {
  const [phoneInput, setPhoneInput] = useState(initialPhone)
  const [searchedPhone, setSearchedPhone] = useState(initialPhone ? initialPhone.trim() : '')
  const [phoneError, setPhoneError] = useState(null)

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Quick filter tab: 'all' | 'upcoming' | 'past' | 'cancelled'
  const [activeTab, setActiveTab] = useState('all')

  // Copy booking ID state
  const [copiedId, setCopiedId] = useState(null)

  // Cancellation modal state
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelModalError, setCancelModalError] = useState(null)
  const [cancelSuccessAlert, setCancelSuccessAlert] = useState(null)

  // Validate Indian Phone Number
  const validatePhone = (input) => {
    if (!input || !input.trim()) {
      return 'Please enter your registered mobile number.'
    }
    const cleaned = input.replace(/[\s\-()]/g, '')
    const regex = /^(?:\+91|91|0)?([6-9]\d{9})$/
    if (!regex.test(cleaned)) {
      return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).'
    }
    return null
  }

  // Fetch bookings from API
  const fetchBookings = (rawPhone) => {
    const err = validatePhone(rawPhone)
    if (err) {
      setPhoneError(err)
      return
    }

    setPhoneError(null)
    setIsLoading(true)
    setError(null)
    setCancelSuccessAlert(null)

    const cleaned = rawPhone.replace(/[\s\-()]/g, '')
    const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/)
    const normalized = match ? match[1] : cleaned

    fetch(`${API_BASE_URL}/bookings/history?phone=${encodeURIComponent(normalized)}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('Too many lookup requests. Please wait a minute before searching again.')
          }
          throw new Error(`Unable to fetch booking history (HTTP ${res.status}).`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.bookings)) {
          setBookings(data.bookings)
          setSearchedPhone(normalized)
          setHasSearched(true)
        } else {
          throw new Error(data.message || 'Failed to retrieve booking records.')
        }
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to the booking service.')
        setIsLoading(false)
      })
  }

  // Auto-search if initialPhone was provided
  useEffect(() => {
    if (initialPhone && initialPhone.trim()) {
      fetchBookings(initialPhone)
    }
  }, [initialPhone])

  // Handle Form Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchBookings(phoneInput)
  }

  // Handle Copy Booking ID
  const handleCopyId = (id) => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Open Cancel Modal
  const handleOpenCancelModal = (booking) => {
    setBookingToCancel(booking)
    setCancelModalError(null)
  }

  // Close Cancel Modal
  const handleCloseCancelModal = () => {
    if (isCancelling) return
    setBookingToCancel(null)
    setCancelModalError(null)
  }

  // Confirm Cancellation Request
  const handleConfirmCancel = () => {
    if (!bookingToCancel) return

    setIsCancelling(true)
    setCancelModalError(null)

    fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingToCancel.booking_id)}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: searchedPhone || phoneInput
      })
    })
      .then((res) => res.json().then((data) => ({ status: res.status, ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed to cancel appointment. Please try again.')
        }

        // Successfully cancelled
        setIsCancelling(false)
        setBookingToCancel(null)
        setCancelSuccessAlert(
          `Appointment ${data.booking.booking_id} has been cancelled successfully. The time slot is now released.`
        )

        // Refresh booking list immediately
        if (searchedPhone) {
          fetchBookings(searchedPhone)
        }
      })
      .catch((err) => {
        setIsCancelling(false)
        setCancelModalError(err.message || 'An error occurred while cancelling the appointment.')
      })
  }

  // Partition bookings into the 3 core categories
  const upcomingBookings = bookings.filter(
    (b) => b.display_status === 'Confirmed' && !b.is_past
  )
  const pastBookings = bookings.filter(
    (b) => b.is_past && b.display_status !== 'Cancelled'
  )
  const cancelledBookings = bookings.filter(
    (b) => b.display_status === 'Cancelled' || b.status?.toLowerCase() === 'cancelled'
  )

  // Render a Single Booking Card
  const renderBookingCard = (booking) => {
    const isCancelled = booking.display_status === 'Cancelled' || booking.status?.toLowerCase() === 'cancelled'
    const isPast = booking.is_past && !isCancelled
    const isUpcoming = !isPast && !isCancelled
    const CategoryIcon = getCategoryIcon(booking.category_name)

    return (
      <div key={booking.id || booking.booking_id} className={`manage-booking-card ${isCancelled ? 'cancelled-card' : ''}`}>
        {/* Card Header: Booking ID & Status Badge */}
        <div className="manage-card-header">
          <div className="manage-id-group">
            <span className="manage-id-label">Booking ID</span>
            <div className="manage-id-copy-row">
              <strong className="manage-id-code">{booking.booking_id}</strong>
              <button
                type="button"
                className={`btn-copy-mini ${copiedId === booking.booking_id ? 'copied' : ''}`}
                onClick={() => handleCopyId(booking.booking_id)}
                title="Copy Booking ID"
                aria-label="Copy Booking ID"
              >
                {copiedId === booking.booking_id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="manage-status-badge-wrapper">
            {isUpcoming && (
              <span className="status-pill status-confirmed">
                <CheckCircle2 size={13} /> Confirmed
              </span>
            )}
            {isPast && (
              <span className="status-pill status-past">
                <Clock size={13} /> Completed / Past
              </span>
            )}
            {isCancelled && (
              <span className="status-pill status-cancelled">
                <XCircle size={13} /> Cancelled
              </span>
            )}
          </div>
        </div>

        {/* Card Body: Specialist & Service Meta */}
        <div className="manage-card-body">
          <div className="manage-provider-row">
            <div className="manage-category-avatar">
              <CategoryIcon size={20} />
            </div>
            <div className="manage-provider-meta">
              <h3 className="manage-provider-name">{booking.provider_name}</h3>
              <p className="manage-provider-spec">
                <span className="category-tag">{booking.category_name || 'Specialist'}</span>
                <span className="dot-divider">•</span>
                <span>{booking.provider_specialization}</span>
              </p>
            </div>
          </div>

          <div className="manage-details-grid">
            <div className="manage-detail-item">
              <Calendar size={15} className="detail-icon" />
              <div>
                <span className="detail-label">Appointment Date</span>
                <span className="detail-value">{formatDisplayDate(booking.appointment_date)}</span>
              </div>
            </div>

            <div className="manage-detail-item">
              <Clock size={15} className="detail-icon" />
              <div>
                <span className="detail-label">Appointment Time</span>
                <span className="detail-value">
                  {formatDisplayTime(booking.start_time)} – {formatDisplayTime(booking.end_time)}
                </span>
              </div>
            </div>

            <div className="manage-detail-item">
              <MapPin size={15} className="detail-icon" />
              <div>
                <span className="detail-label">Location / City</span>
                <span className="detail-value">
                  {booking.provider_location ? `${booking.provider_location}, ` : ''}
                  {booking.provider_city}
                  {booking.provider_state ? `, ${booking.provider_state}` : ''}
                </span>
              </div>
            </div>

            <div className="manage-detail-item">
              <CreditCard size={15} className="detail-icon" />
              <div>
                <span className="detail-label">Consultation Fee</span>
                <span className="detail-value fee-value">₹{booking.consultation_fee}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Action / Context Info */}
        <div className="manage-card-footer">
          {isUpcoming && (
            <div className="card-footer-actions">
              <span className="footer-notice">
                <ShieldCheck size={14} className="text-success" />
                Active upcoming appointment
              </span>
              <button
                type="button"
                className="btn btn-cancel-booking"
                onClick={() => handleOpenCancelModal(booking)}
              >
                <XCircle size={15} />
                <span>Cancel Booking</span>
              </button>
            </div>
          )}

          {isPast && (
            <div className="card-footer-past">
              <Clock size={14} />
              <span>This appointment has already concluded.</span>
            </div>
          )}

          {isCancelled && (
            <div className="card-footer-cancelled">
              <XCircle size={14} />
              <span>This booking was cancelled. The time slot has been released.</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <section className="manage-booking-section" aria-label="Manage Bookings">
      <div className="container manage-container">
        {/* Header Breadcrumbs / Nav Row */}
        <div className="manage-header-row">
          <button
            type="button"
            className="btn btn-text btn-back"
            onClick={onNavigateHome}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {onBookNew && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBookNew}
            >
              <span>Book New Appointment</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Page Title & Intro */}
        <div className="manage-hero-card">
          <div className="manage-hero-badge">
            <Calendar size={14} />
            <span>Customer Self-Service Portal</span>
          </div>
          <h1 className="manage-title">Manage Your Bookings</h1>
          <p className="manage-subtitle">
            Enter the 10-digit mobile number you used while booking to view upcoming visits, look up your past appointment records, or cancel reservations.
          </p>

          {/* Phone Lookup Form */}
          <form className="phone-search-form" onSubmit={handleSearchSubmit}>
            <div className="phone-input-group">
              <div className="phone-prefix-addon">
                <span>+91</span>
              </div>
              <div className="phone-input-wrapper">
                <Phone size={18} className="phone-icon" />
                <input
                  type="tel"
                  id="manage-phone-input"
                  className={`phone-input ${phoneError ? 'input-error' : ''}`}
                  placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value)
                    if (phoneError) setPhoneError(null)
                  }}
                  maxLength={15}
                  autoComplete="tel"
                  disabled={isLoading}
                />
                {phoneInput && (
                  <button
                    type="button"
                    className="btn-clear-input"
                    onClick={() => {
                      setPhoneInput('')
                      setPhoneError(null)
                    }}
                    aria-label="Clear input"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-search-bookings"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-icon" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>View My Bookings</span>
                  </>
                )}
              </button>
            </div>

            {phoneError && (
              <div className="form-error-message" role="alert">
                <AlertCircle size={14} />
                <span>{phoneError}</span>
              </div>
            )}
          </form>

          {/* Simple Identification & Security Disclaimer */}
          <div className="security-notice-strip">
            <Info size={14} className="security-info-icon" />
            <span>
              <strong>Note:</strong> We identify your reservations through your booking mobile number without requiring passwords. For your privacy, keep your confirmation details confidential.
            </span>
          </div>
        </div>

        {/* Success Alert Banner (e.g. after cancellation) */}
        {cancelSuccessAlert && (
          <div className="alert-banner alert-success" role="alert">
            <CheckCircle2 size={18} />
            <div className="alert-content">
              <strong>Success:</strong> {cancelSuccessAlert}
            </div>
            <button
              type="button"
              className="alert-close-btn"
              onClick={() => setCancelSuccessAlert(null)}
              aria-label="Close alert"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="alert-banner alert-danger" role="alert">
            <AlertCircle size={18} />
            <div className="alert-content">
              <strong>Error:</strong> {error}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => fetchBookings(searchedPhone || phoneInput)}
              style={{ marginLeft: 'auto' }}
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="manage-loading-state">
            <RefreshCw size={36} className="spin-icon text-primary" />
            <h3>Fetching Your Appointments...</h3>
            <p>Please wait while we retrieve your booking records from the server.</p>
          </div>
        )}

        {/* Search Results Area */}
        {!isLoading && hasSearched && (
          <div className="manage-results-wrapper">
            {/* Quick Stats & Tabs Header */}
            <div className="manage-results-header">
              <div className="results-count-meta">
                <h2 className="results-title">
                  Appointments for <span>+91 {searchedPhone}</span>
                </h2>
                <span className="results-badge">
                  {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'} Found
                </span>
              </div>

              {/* Segmented Filter Tabs */}
              {bookings.length > 0 && (
                <div className="manage-tabs-bar" role="tablist">
                  <button
                    type="button"
                    className={`manage-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                  >
                    <span>All Bookings</span>
                    <span className="tab-counter">{bookings.length}</span>
                  </button>

                  <button
                    type="button"
                    className={`manage-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                  >
                    <span>Upcoming</span>
                    <span className="tab-counter counter-success">{upcomingBookings.length}</span>
                  </button>

                  <button
                    type="button"
                    className={`manage-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                  >
                    <span>Past</span>
                    <span className="tab-counter">{pastBookings.length}</span>
                  </button>

                  <button
                    type="button"
                    className={`manage-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setActiveTab('cancelled')}
                  >
                    <span>Cancelled</span>
                    <span className="tab-counter counter-danger">{cancelledBookings.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Empty State: Zero Total Bookings Found */}
            {bookings.length === 0 && (
              <div className="manage-empty-state">
                <div className="empty-state-icon-circle">
                  <CalendarX size={44} />
                </div>
                <h3>No Appointments Found</h3>
                <p>
                  We couldn't find any appointments booked under <strong>+91 {searchedPhone}</strong>. If you used a different phone number, please search again.
                </p>
                {onBookNew && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onBookNew}
                    style={{ marginTop: '1rem' }}
                  >
                    <span>Book an Appointment Now</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}

            {/* When Tab is 'all': Render the 3 Structured Sections */}
            {bookings.length > 0 && activeTab === 'all' && (
              <div className="manage-sections-stack">
                {/* 1. Upcoming Appointments Section */}
                <section className="manage-sub-section">
                  <div className="section-header-row">
                    <div className="section-title-group">
                      <h3 className="section-heading">
                        <CheckCircle2 size={20} className="text-success" />
                        Upcoming Appointments
                      </h3>
                      <span className="section-tag">{upcomingBookings.length}</span>
                    </div>
                  </div>

                  {upcomingBookings.length > 0 ? (
                    <div className="manage-cards-grid">
                      {upcomingBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="section-empty-card">
                      <Calendar size={24} className="text-muted" />
                      <p>No upcoming appointments scheduled.</p>
                      {onBookNew && (
                        <button type="button" className="btn btn-text btn-sm" onClick={onBookNew}>
                          Book a new visit &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </section>

                {/* 2. Past Appointments Section */}
                <section className="manage-sub-section">
                  <div className="section-header-row">
                    <div className="section-title-group">
                      <h3 className="section-heading">
                        <Clock size={20} className="text-muted" />
                        Past Appointments
                      </h3>
                      <span className="section-tag">{pastBookings.length}</span>
                    </div>
                  </div>

                  {pastBookings.length > 0 ? (
                    <div className="manage-cards-grid">
                      {pastBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="section-empty-card">
                      <Clock size={24} className="text-muted" />
                      <p>No past appointments recorded for this number.</p>
                    </div>
                  )}
                </section>

                {/* 3. Cancelled Appointments Section */}
                <section className="manage-sub-section">
                  <div className="section-header-row">
                    <div className="section-title-group">
                      <h3 className="section-heading">
                        <XCircle size={20} className="text-danger" />
                        Cancelled Appointments
                      </h3>
                      <span className="section-tag">{cancelledBookings.length}</span>
                    </div>
                  </div>

                  {cancelledBookings.length > 0 ? (
                    <div className="manage-cards-grid">
                      {cancelledBookings.map(renderBookingCard)}
                    </div>
                  ) : (
                    <div className="section-empty-card">
                      <XCircle size={24} className="text-muted" />
                      <p>No cancelled appointments on record.</p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* When Tab is 'upcoming' */}
            {bookings.length > 0 && activeTab === 'upcoming' && (
              <div className="filtered-tab-content">
                {upcomingBookings.length > 0 ? (
                  <div className="manage-cards-grid">
                    {upcomingBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="section-empty-card large">
                    <Calendar size={32} className="text-muted" />
                    <h4>No Upcoming Appointments</h4>
                    <p>You have no active future appointments scheduled under this mobile number.</p>
                    {onBookNew && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={onBookNew}>
                        Book an Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* When Tab is 'past' */}
            {bookings.length > 0 && activeTab === 'past' && (
              <div className="filtered-tab-content">
                {pastBookings.length > 0 ? (
                  <div className="manage-cards-grid">
                    {pastBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="section-empty-card large">
                    <Clock size={32} className="text-muted" />
                    <h4>No Past Appointments</h4>
                    <p>There are no past or completed appointment records for this mobile number.</p>
                  </div>
                )}
              </div>
            )}

            {/* When Tab is 'cancelled' */}
            {bookings.length > 0 && activeTab === 'cancelled' && (
              <div className="filtered-tab-content">
                {cancelledBookings.length > 0 ? (
                  <div className="manage-cards-grid">
                    {cancelledBookings.map(renderBookingCard)}
                  </div>
                ) : (
                  <div className="section-empty-card large">
                    <XCircle size={32} className="text-muted" />
                    <h4>No Cancelled Appointments</h4>
                    <p>You have not cancelled any appointments.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Initial Prompt State Before User Has Searched */}
        {!isLoading && !hasSearched && (
          <div className="manage-initial-state">
            <div className="initial-features-grid">
              <div className="feature-item">
                <div className="feature-icon">
                  <Calendar size={22} />
                </div>
                <h4>Review Upcoming Visits</h4>
                <p>Check the scheduled date, time slot, and clinic location of all your upcoming appointments.</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Clock size={22} />
                </div>
                <h4>Browse Complete History</h4>
                <p>Access your past consultations, verified receipts, and previous bookings across all categories.</p>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <XCircle size={22} />
                </div>
                <h4>Instant Slot Cancellation</h4>
                <p>Plans changed? Easily cancel upcoming appointments anytime to release the slot for others.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Booking Cancellation */}
      {bookingToCancel && (
        <div className="manage-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="manage-modal-card">
            <div className="modal-header">
              <div className="modal-icon-badge danger">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 id="modal-title" className="modal-title">Confirm Cancellation</h3>
                <p className="modal-subtitle">Are you sure you want to cancel this appointment?</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseCancelModal}
                disabled={isCancelling}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Appointment summary recap inside modal */}
              <div className="modal-appointment-summary">
                <div className="summary-row">
                  <span className="summary-label">Booking ID:</span>
                  <strong className="summary-value">{bookingToCancel.booking_id}</strong>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Specialist:</span>
                  <span className="summary-value">{bookingToCancel.provider_name}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">{bookingToCancel.category_name} • {bookingToCancel.provider_specialization}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Scheduled For:</span>
                  <span className="summary-value">
                    {formatDisplayDate(bookingToCancel.appointment_date)} at {formatDisplayTime(bookingToCancel.start_time)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Location:</span>
                  <span className="summary-value">{bookingToCancel.provider_city} ({bookingToCancel.provider_location})</span>
                </div>
              </div>

              <div className="cancellation-warning-callout">
                <AlertCircle size={16} />
                <span>
                  Once cancelled, this time slot will immediately become available for others to book. This action cannot be reversed.
                </span>
              </div>

              {cancelModalError && (
                <div className="modal-error-banner" role="alert">
                  <AlertCircle size={15} />
                  <span>{cancelModalError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseCancelModal}
                disabled={isCancelling}
              >
                <span>Keep Appointment</span>
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <RefreshCw size={15} className="spin-icon" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    <span>Yes, Cancel Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
