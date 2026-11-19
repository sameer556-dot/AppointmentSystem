import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Printer,
  Home,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  Sparkle
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
  if (!dateStr) return 'Not selected'
  const [year, month, day] = dateStr.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function BookingConfirmation({
  initialBookingData,
  bookingId,
  selectedCategory,
  onBackToHome,
  onManageBookings
}) {
  const [booking, setBooking] = useState(initialBookingData || null)
  const [isLoading, setIsLoading] = useState(!initialBookingData && Boolean(bookingId))
  const [fetchError, setFetchError] = useState(null)
  const [isCopied, setIsCopied] = useState(false)

  const activeBookingId = initialBookingData?.booking_id || bookingId

  // Fetch booking details if not available in initial props (e.g. on page refresh)
  useEffect(() => {
    if (initialBookingData) {
      setBooking(initialBookingData)
      setIsLoading(false)
      return
    }

    if (activeBookingId) {
      setIsLoading(true)
      setFetchError(null)

      fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(activeBookingId)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(
              res.status === 404
                ? `Booking reference '${activeBookingId}' not found.`
                : `Server returned HTTP ${res.status}`
            )
          }
          return res.json()
        })
        .then((data) => {
          if (data.status === 'success' && data.booking) {
            setBooking(data.booking)
          } else {
            throw new Error(data.message || 'Unable to retrieve booking record.')
          }
          setIsLoading(false)
        })
        .catch((err) => {
          console.error('Fetch booking error:', err)
          setFetchError(err.message || 'Failed to load booking details.')
          setIsLoading(false)
        })
    }
  }, [initialBookingData, activeBookingId])

  // Copy Booking ID with visual feedback
  const handleCopyBookingId = async () => {
    const idToCopy = booking?.booking_id || activeBookingId
    if (!idToCopy) return

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(idToCopy)
      } else {
        // Fallback for older browsers
        const tempInput = document.createElement('input')
        tempInput.value = idToCopy
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
      }
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch (err) {
      console.warn('Clipboard write error:', err)
    }
  }

  // Built-in browser print
  const handlePrint = () => {
    window.print()
  }

  // Loading State
  if (isLoading) {
    return (
      <section className="workflow-section">
        <div className="section-container">
          <div className="confirmation-status-box loading">
            <RefreshCw size={36} className="spinner-icon" />
            <h3>Loading Booking Confirmation...</h3>
            <p>Retrieving your confirmed appointment record from the database.</p>
          </div>
        </div>
      </section>
    )
  }

  // Error State (Invalid booking ID or network error)
  if (fetchError || !booking) {
    return (
      <section className="workflow-section">
        <div className="section-container">
          <div className="confirmation-status-box error">
            <AlertCircle size={40} className="error-icon" />
            <h3>Booking Not Found</h3>
            <p>{fetchError || 'No booking reference details could be found.'}</p>
            <div className="status-actions">
              {activeBookingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw size={15} />
                  <span>Retry</span>
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={onBackToHome}
              >
                <Home size={15} />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const categoryIconName = booking.category_icon || selectedCategory?.icon || 'sparkle'
  const IconComponent = getCategoryIcon(categoryIconName)

  return (
    <section className="workflow-section confirmation-section">
      <div className="section-container">
        {/* Booking Workflow Stepper Bar (All 5 Steps Completed) */}
        <div className="workflow-stepper no-print">
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Service Category</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Location & Date</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Find Provider</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Time Slot</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Confirmed</span>
          </div>
        </div>

        {/* Printable Confirmation Card */}
        <div className="printable-confirmation-card">
          {/* Success Banner */}
          <div className="confirmation-header">
            <div className="success-pulse-circle">
              <CheckCircle2 size={46} className="text-white" />
            </div>
            <span className="confirmation-badge">Official Confirmation Voucher</span>
            <h1 className="confirmation-main-title">Appointment Booked Successfully!</h1>
            <p className="confirmation-sub-text">
              Your appointment has been confirmed. Here are your booking details.
            </p>
          </div>

          {/* Prominent Booking ID & Quick Actions Box */}
          <div className="booking-id-container">
            <div className="booking-id-meta">
              <span className="id-sublabel">Your Unique Booking ID</span>
              <span className="id-value">{booking.booking_id}</span>
            </div>

            <div className="booking-id-actions no-print">
              <button
                type="button"
                className={`btn-copy-id ${isCopied ? 'copied' : ''}`}
                onClick={handleCopyBookingId}
                title="Copy Booking ID to clipboard"
                aria-label="Copy Booking ID"
              >
                {isCopied ? (
                  <>
                    <Check size={15} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Booking ID</span>
                  </>
                )}
              </button>

              <span className="confirmed-pill">
                <ShieldCheck size={14} /> {booking.status || 'Confirmed'}
              </span>
            </div>
          </div>

          {/* Details Grid: Structured Information Display */}
          <div className="appointment-receipt-grid">
            {/* 1. Service Category */}
            <div className="receipt-item">
              <div className="receipt-icon category-icon">
                <IconComponent size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Service Category</span>
                <strong className="receipt-value">{booking.category_name || selectedCategory?.name || 'Service'}</strong>
              </div>
            </div>

            {/* 2. Provider Specialist */}
            <div className="receipt-item">
              <div className="receipt-icon provider-icon">
                <User size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Specialist</span>
                <strong className="receipt-value">{booking.provider_name}</strong>
                <span className="receipt-sub">{booking.provider_specialization}</span>
              </div>
            </div>

            {/* 3. Appointment Date */}
            <div className="receipt-item">
              <div className="receipt-icon date-icon">
                <Calendar size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Appointment Date</span>
                <strong className="receipt-value">{formatDisplayDate(booking.appointment_date)}</strong>
              </div>
            </div>

            {/* 4. Appointment Time Slot */}
            <div className="receipt-item">
              <div className="receipt-icon time-icon">
                <Clock size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Scheduled Time Slot</span>
                <strong className="receipt-value highlight-time">
                  {booking.start_time} - {booking.end_time}
                </strong>
              </div>
            </div>

            {/* 5. Provider Location */}
            <div className="receipt-item">
              <div className="receipt-icon location-icon">
                <MapPin size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Clinic / Venue Location</span>
                <strong className="receipt-value">
                  {booking.provider_location}, {booking.provider_city}{booking.provider_state ? `, ${booking.provider_state}` : ''}
                </strong>
              </div>
            </div>

            {/* 6. Consultation Fee */}
            <div className="receipt-item">
              <div className="receipt-icon fee-icon">
                <CreditCard size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Consultation Fee</span>
                <strong className="receipt-value fee-value">₹{booking.consultation_fee}</strong>
                <span className="receipt-sub">Payable directly at appointment</span>
              </div>
            </div>

            {/* 7. Customer Full Name */}
            <div className="receipt-item">
              <div className="receipt-icon customer-icon">
                <User size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Customer Name</span>
                <strong className="receipt-value">{booking.customer_name}</strong>
              </div>
            </div>

            {/* 8. Customer Phone Number */}
            <div className="receipt-item">
              <div className="receipt-icon phone-icon">
                <Phone size={20} />
              </div>
              <div className="receipt-content">
                <span className="receipt-label">Contact Phone</span>
                <strong className="receipt-value">+91 {booking.customer_phone}</strong>
              </div>
            </div>

            {/* 9. Customer Email (Only if provided) */}
            {booking.customer_email && (
              <div className="receipt-item full-width">
                <div className="receipt-icon email-icon">
                  <Mail size={20} />
                </div>
                <div className="receipt-content">
                  <span className="receipt-label">Email Receipt Address</span>
                  <strong className="receipt-value">{booking.customer_email}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Important Arrival Advice Box */}
          <div className="appointment-advice-box">
            <h4>Important Appointment Guidelines</h4>
            <ul>
              <li>Please arrive <strong>10 minutes prior</strong> to your scheduled slot ({booking.start_time}).</li>
              <li>Please carry your Booking ID (<strong>{booking.booking_id}</strong>) for verification at the reception desk.</li>
              <li>Consultation fee of <strong>₹{booking.consultation_fee}</strong> can be paid via UPI, card, or cash at the venue.</li>
            </ul>
          </div>

          {/* Action Row: Back to Home & Print Buttons */}
          <div className="confirmation-action-buttons no-print">
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={handlePrint}
            >
              <Printer size={18} />
              <span>Print Appointment Details</span>
            </button>

            {onManageBookings && (
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={onManageBookings}
              >
                <Clock size={18} />
                <span>Manage My Bookings</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={onBackToHome}
            >
              <Home size={18} />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
