import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  Star,
  CreditCard,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  CalendarX,
  Check,
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

// Generate initials from provider name
const getInitials = (name) => {
  if (!name) return 'PR'
  const cleanName = name.replace(/^Dr\.\s+/i, '')
  const parts = cleanName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

export default function ProviderDetails({
  selectedCategory,
  selectedLocation,
  selectedDate,
  selectedProvider,
  selectedSlot,
  onSelectSlot,
  onProceedToCustomerDetails,
  onBackToProviders,
  onBackToCategories
}) {
  const [providerDetails, setProviderDetails] = useState(selectedProvider)
  const [slots, setSlots] = useState([])
  const [dayName, setDayName] = useState('')
  const [workingHours, setWorkingHours] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [emptyMessage, setEmptyMessage] = useState('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(true)
  const [slotsError, setSlotsError] = useState(null)
  const [isConfirmedStepNoticeOpen, setIsConfirmedStepNoticeOpen] = useState(false)

  const providerId = selectedProvider?.id

  // Fetch complete provider details from backend API
  useEffect(() => {
    if (!providerId) return

    fetch(`${API_BASE_URL}/providers/${providerId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load provider (HTTP ${res.status})`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && data.provider) {
          setProviderDetails(data.provider)
        }
      })
      .catch((err) => {
        console.warn('Using existing provider details state; backend fetch notice:', err)
      })
  }, [providerId])

  // Fetch available appointment slots for selected provider & date
  const fetchSlots = () => {
    if (!providerId || !selectedDate) return

    setIsLoadingSlots(true)
    setSlotsError(null)

    const url = `${API_BASE_URL}/providers/${providerId}/slots?date=${selectedDate}`

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Availability service returned HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success') {
          setSlots(Array.isArray(data.slots) ? data.slots : [])
          setDayName(data.day_name || '')
          setWorkingHours(data.working_hours || '')
          setIsAvailable(Boolean(data.is_available))
          setEmptyMessage(data.message || 'No appointment slots available for this date.')
        } else {
          throw new Error(data.message || 'Failed to fetch appointment slots.')
        }
        setIsLoadingSlots(false)
      })
      .catch((err) => {
        console.error('Slots fetch error:', err)
        setSlotsError(err.message || 'Unable to connect to the slot availability service.')
        setIsLoadingSlots(false)
      })
  }

  useEffect(() => {
    fetchSlots()
  }, [providerId, selectedDate])

  const IconComponent = selectedCategory ? getCategoryIcon(selectedCategory.icon) : Sparkle
  const provider = providerDetails || selectedProvider

  return (
    <section className="workflow-section">
      <div className="section-container">
        {/* Booking Workflow Stepper Bar */}
        <div className="workflow-stepper">
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
          <div className="workflow-step active">
            <span className="step-circle">4</span>
            <span className="step-label">Select Time Slot</span>
          </div>
          <div className="workflow-divider" />
          <div className="workflow-step pending">
            <span className="step-circle">5</span>
            <span className="step-label">Customer Details</span>
          </div>
        </div>

        {/* Back Button & Header Navigation */}
        <div className="provider-details-top-bar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBackToProviders}
          >
            <ArrowLeft size={15} />
            <span>Back to Providers</span>
          </button>

          <div className="top-category-pill">
            <IconComponent size={14} className="text-primary" />
            <span>Category: <strong>{selectedCategory?.name}</strong></span>
          </div>
        </div>

        {/* Main Details Layout (Two-Column on Desktop) */}
        <div className="provider-details-layout">
          {/* Left Column: Comprehensive Provider Profile Card */}
          <div className="provider-info-panel">
            <div className="provider-profile-card">
              <div className="provider-profile-header">
                <div className="provider-avatar-wrapper large">
                  {provider?.profile_image ? (
                    <img
                      src={provider.profile_image}
                      alt={provider.name}
                      className="provider-avatar large"
                    />
                  ) : (
                    <div className="provider-avatar large">
                      <span>{getInitials(provider?.name)}</span>
                    </div>
                  )}
                  <span className="provider-status-dot online" title="Accepting appointments" />
                </div>

                <div className="provider-profile-heading">
                  <div className="provider-title-row">
                    <h2 className="provider-name large">{provider?.name}</h2>
                    <span className="badge-verified-small">
                      <ShieldCheck size={13} /> Certified Specialist
                    </span>
                  </div>
                  <p className="provider-specialization large">{provider?.specialization}</p>

                  <div className="provider-rating-row" style={{ marginTop: '0.4rem' }}>
                    <div className="star-rating">
                      <Star size={15} fill="#eab308" color="#eab308" />
                      <span className="rating-num">{provider?.rating?.toFixed(1)}</span>
                    </div>
                    <span className="reviews-count">({provider?.total_reviews} reviews)</span>
                    <span className="dot-separator">•</span>
                    <span className="experience-badge">
                      <Briefcase size={12} /> {provider?.experience_years} yrs exp
                    </span>
                  </div>
                </div>
              </div>

              {/* Provider Description */}
              <div className="provider-bio-section">
                <h4 className="section-subheading">About the Specialist</h4>
                <p className="provider-bio-text">{provider?.description}</p>
              </div>

              {/* Provider Quick Facts / Highlights */}
              <div className="provider-highlights-grid">
                <div className="highlight-box">
                  <span className="highlight-icon location">
                    <MapPin size={16} />
                  </span>
                  <div className="highlight-meta">
                    <span className="highlight-label">Consultation Location</span>
                    <span className="highlight-val">{provider?.location}, {provider?.city}{provider?.state ? `, ${provider?.state}` : ''}</span>
                  </div>
                </div>

                <div className="highlight-box">
                  <span className="highlight-icon fee">
                    <CreditCard size={16} />
                  </span>
                  <div className="highlight-meta">
                    <span className="highlight-label">Consultation Fee</span>
                    <span className="highlight-val">₹{provider?.consultation_fee}</span>
                  </div>
                </div>

                <div className="highlight-box">
                  <span className="highlight-icon date">
                    <Calendar size={16} />
                  </span>
                  <div className="highlight-meta">
                    <span className="highlight-label">Selected Date</span>
                    <span className="highlight-val">{formatDisplayDate(selectedDate)}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Context Notice */}
              <div className="appointment-context-box">
                <div className="context-title">
                  <IconComponent size={14} className="text-primary" />
                  <span>Requested Service</span>
                </div>
                <p className="context-text">
                  You are booking a <strong>{selectedCategory?.name}</strong> consultation with <strong>{provider?.name}</strong> for <strong>{formatDisplayDate(selectedDate)}</strong> in <strong>{selectedLocation || provider?.location}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Time Slot Selection Panel */}
          <div className="provider-slots-panel">
            <div className="slots-card">
              <div className="slots-card-header">
                <div className="slots-header-titles">
                  <h3 className="slots-title">Select Appointment Time</h3>
                  <p className="slots-subtitle">
                    Available slots for <strong>{dayName || 'the selected date'}</strong>, {formatDisplayDate(selectedDate)}
                  </p>
                </div>
                {workingHours && (
                  <span className="working-hours-badge">
                    <Clock size={13} /> {workingHours}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {isLoadingSlots && (
                <div className="slots-status-card loading">
                  <RefreshCw size={26} className="spinner-icon" />
                  <p>Fetching real-time available appointment slots...</p>
                </div>
              )}

              {/* Error State */}
              {!isLoadingSlots && slotsError && (
                <div className="slots-status-card error">
                  <AlertCircle size={28} className="error-icon" />
                  <div className="error-text">
                    <h4>Failed to Load Slots</h4>
                    <p>{slotsError}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={fetchSlots}
                  >
                    <RefreshCw size={13} />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Empty State (No slots available on this date or all past) */}
              {!isLoadingSlots && !slotsError && slots.length === 0 && (
                <div className="slots-status-card empty">
                  <CalendarX size={34} className="empty-icon" />
                  <h4>No Slots Available for this Date</h4>
                  <p className="status-text">{emptyMessage}</p>
                  <p className="status-tip">
                    {dayName === 'Sunday'
                      ? 'Specialists are unavailable on Sundays. Please return to select another date (Monday – Saturday).'
                      : 'All slots for today may have already passed. Please select an upcoming date to book your appointment.'}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={onBackToProviders}
                    style={{ marginTop: '0.75rem' }}
                  >
                    <ArrowLeft size={14} />
                    <span>Choose Different Date</span>
                  </button>
                </div>
              )}

              {/* Slots Available Grid */}
              {!isLoadingSlots && !slotsError && slots.length > 0 && (
                <div className="slots-content">
                  <div className="slots-instructions">
                    <span>Choose an appointment start time below:</span>
                    <span className="slots-count-tag">{slots.length} available</span>
                  </div>

                  <div className="slots-grid">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id || selectedSlot?.start_time === slot.start_time
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className={`slot-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => onSelectSlot(slot)}
                          aria-label={`Select slot at ${slot.label}`}
                          aria-pressed={isSelected}
                        >
                          <div className="slot-chip-main">
                            <Clock size={13} className="slot-clock-icon" />
                            <span className="slot-time-text">{slot.label}</span>
                          </div>
                          {isSelected && (
                            <span className="slot-selected-check">
                              <Check size={13} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Selected Slot Confirmation Banner */}
                  {selectedSlot ? (
                    <div className="selected-slot-banner">
                      <div className="selected-slot-meta">
                        <CheckCircle2 size={20} className="text-success" />
                        <div>
                          <span className="selected-banner-label">Selected Appointment Slot</span>
                          <h4 className="selected-banner-time">
                            {selectedSlot.formatted || `${selectedSlot.start_time} - ${selectedSlot.end_time}`}
                          </h4>
                          <span className="selected-banner-date">
                            {formatDisplayDate(selectedDate)} • Fee: ₹{provider?.consultation_fee}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="slot-unselected-hint">
                      <span>Please tap on an available time slot above to continue.</span>
                    </div>
                  )}

                  {/* Action Row */}
                  <div className="slots-action-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg btn-full"
                      disabled={!selectedSlot}
                      onClick={onProceedToCustomerDetails}
                    >
                      <span>Proceed to Customer Details</span>
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informative Modal / Notice for Step 4 Completion */}
        {isConfirmedStepNoticeOpen && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-icon-header">
                <CheckCircle2 size={36} className="text-success" />
              </div>
              <h3 className="modal-title">Appointment Slot Selected!</h3>
              <p className="modal-subtitle">
                You have selected <strong>{selectedSlot?.formatted}</strong> on <strong>{formatDisplayDate(selectedDate)}</strong> with <strong>{provider?.name}</strong>.
              </p>

              <div className="modal-summary-box">
                <div className="modal-summary-item">
                  <span className="summary-lbl">Service:</span>
                  <span className="summary-val">{selectedCategory?.name}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="summary-lbl">Location:</span>
                  <span className="summary-val">{provider?.location}, {provider?.city}{provider?.state ? `, ${provider?.state}` : ''}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="summary-lbl">Fee:</span>
                  <span className="summary-val">₹{provider?.consultation_fee}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="summary-lbl">Slot:</span>
                  <span className="summary-val">{selectedSlot?.formatted}</span>
                </div>
              </div>

              <div className="module8-ready-notice">
                <p>
                  <strong>Module 7 Complete:</strong> Your provider and appointment time slot selections are preserved in React state, ready for Module 8 (Customer Information & Final Confirmation).
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  onClick={() => setIsConfirmedStepNoticeOpen(false)}
                >
                  <span>Close & Keep Selected Slot</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
