import { useState } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  Sparkle,
  Lock
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

export default function CustomerDetails({
  selectedCategory,
  selectedLocation,
  selectedDate,
  selectedProvider,
  selectedSlot,
  customerDetails,
  onCustomerDetailsChange,
  onBookingSuccess,
  onBackToSlots
}) {
  const [formData, setFormData] = useState({
    name: customerDetails?.name || '',
    phone: customerDetails?.phone || '',
    email: customerDetails?.email || ''
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isSlotConflict, setIsSlotConflict] = useState(false)

  // Validation functions
  const validateName = (nameStr) => {
    const trimmed = (nameStr || '').trim()
    if (!trimmed) {
      return 'Full name is required.'
    }
    if (trimmed.length < 2) {
      return 'Full name must be at least 2 characters.'
    }
    if (trimmed.length > 100) {
      return 'Full name cannot exceed 100 characters.'
    }
    if (!/[a-zA-Z]/.test(trimmed)) {
      return 'Full name must contain alphabetical characters.'
    }
    if (/[^a-zA-Z\s\.\'\-]/.test(trimmed)) {
      return 'Full name contains invalid characters. Numbers and symbols are not allowed.'
    }
    return null
  }

  const validatePhone = (phoneStr) => {
    if (!phoneStr || !phoneStr.trim()) {
      return 'Phone number is required.'
    }
    const cleaned = phoneStr.replace(/[\s\-()]/g, '')
    const regex = /^(?:\+91|91|0)?([6-9]\d{9})$/
    if (!regex.test(cleaned)) {
      return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210).'
    }
    return null
  }

  const validateEmail = (emailStr) => {
    const trimmed = (emailStr || '').trim()
    if (!trimmed) return null // Optional field
    const regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
    if (!regex.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@example.com).'
    }
    return null
  }

  const handleInputChange = (field, value) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    if (onCustomerDetailsChange) {
      onCustomerDetailsChange(updated)
    }

    // Clear field-level error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }))
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Run client-side validations
    const nameErr = validateName(formData.name)
    const phoneErr = validatePhone(formData.phone)
    const emailErr = validateEmail(formData.email)

    const errors = {}
    if (nameErr) errors.name = nameErr
    if (phoneErr) errors.phone = phoneErr
    if (emailErr) errors.email = emailErr

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitError(null)
    setIsSlotConflict(false)
    setIsSubmitting(true)

    const payload = {
      provider_id: selectedProvider?.id,
      appointment_date: selectedDate,
      start_time: selectedSlot?.start_time || selectedSlot?.id,
      customer_name: formData.name.trim(),
      customer_phone: formData.phone.trim(),
      customer_email: formData.email.trim() || null
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.status === 201 && data.status === 'success' && data.booking) {
        // Successful booking!
        setIsSubmitting(false)
        onBookingSuccess(data.booking)
      } else if (response.status === 409) {
        // Slot already booked
        setIsSubmitting(false)
        setIsSlotConflict(true)
        setSubmitError(
          data.message ||
          'This appointment slot was just booked by another user. Please choose another time slot.'
        )
      } else {
        // Other validation or server error
        setIsSubmitting(false)
        setSubmitError(data.message || 'Failed to confirm appointment booking. Please verify your details.')
      }
    } catch (err) {
      console.error('Booking submission error:', err)
      setIsSubmitting(false)
      setSubmitError('Unable to connect to the booking service. Please check your connection and try again.')
    }
  }

  const IconComponent = selectedCategory ? getCategoryIcon(selectedCategory.icon) : Sparkle

  return (
    <section className="workflow-section">
      <div className="section-container">
        {/* Booking Workflow Stepper Bar (5 Steps) */}
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
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Time Slot</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step active">
            <span className="step-circle">5</span>
            <span className="step-label">Customer Details</span>
          </div>
        </div>

        {/* Back Button Navigation */}
        <div className="provider-details-top-bar">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBackToSlots}
            disabled={isSubmitting}
          >
            <ArrowLeft size={15} />
            <span>Back to Time Slots</span>
          </button>

          <div className="top-category-pill">
            <IconComponent size={14} className="text-primary" />
            <span>Service: <strong>{selectedCategory?.name}</strong></span>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="customer-details-layout">
          {/* Left Column: Customer Details Form */}
          <div className="customer-form-panel">
            <div className="customer-form-card">
              <div className="customer-form-header">
                <h2 className="customer-form-title">Enter Customer Information</h2>
                <p className="customer-form-subtitle">
                  Please provide your contact details so <strong>{selectedProvider?.name}</strong> can confirm and prepare for your appointment.
                </p>
              </div>

              {/* Server / Conflict Alert Banner */}
              {submitError && (
                <div className={`form-alert-banner ${isSlotConflict ? 'conflict' : 'error'}`}>
                  <AlertCircle size={20} className="alert-icon" />
                  <div className="alert-text">
                    <strong>{isSlotConflict ? 'Slot Already Booked' : 'Booking Error'}</strong>
                    <p>{submitError}</p>
                    {isSlotConflict && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onBackToSlots}
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Clock size={14} />
                        <span>Select Another Time Slot</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="customer-form">
                {/* 1. Full Name Field */}
                <div className="form-field-group">
                  <label htmlFor="customer-name" className="field-label">
                    <span>Full Name</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <User size={18} className="field-icon" />
                    <input
                      id="customer-name"
                      type="text"
                      className={`form-input ${fieldErrors.name ? 'input-error' : ''}`}
                      placeholder="e.g. Aarav Sharma"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <span className="field-error-text">
                      <AlertCircle size={13} />
                      <span>{fieldErrors.name}</span>
                    </span>
                  )}
                </div>

                {/* 2. Indian Phone Number Field */}
                <div className="form-field-group">
                  <label htmlFor="customer-phone" className="field-label">
                    <span>Mobile Phone Number</span>
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Phone size={18} className="field-icon" />
                    <input
                      id="customer-phone"
                      type="tel"
                      className={`form-input ${fieldErrors.phone ? 'input-error' : ''}`}
                      placeholder="10-digit number (e.g. 9876543210 or +91 9876543210)"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="tel"
                    />
                  </div>
                  <span className="field-hint-text">
                    Indian mobile numbers starting with 6, 7, 8, or 9.
                  </span>
                  {fieldErrors.phone && (
                    <span className="field-error-text">
                      <AlertCircle size={13} />
                      <span>{fieldErrors.phone}</span>
                    </span>
                  )}
                </div>

                {/* 3. Optional Email Address Field */}
                <div className="form-field-group">
                  <label htmlFor="customer-email" className="field-label">
                    <span>Email Address</span>
                    <span className="optional-tag">(Optional)</span>
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="customer-email"
                      type="email"
                      className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isSubmitting}
                      autoComplete="email"
                    />
                  </div>
                  <span className="field-hint-text">
                    For digital confirmation receipt.
                  </span>
                  {fieldErrors.email && (
                    <span className="field-error-text">
                      <AlertCircle size={13} />
                      <span>{fieldErrors.email}</span>
                    </span>
                  )}
                </div>

                {/* Privacy & No-Registration Assurance */}
                <div className="privacy-assurance-box">
                  <Lock size={15} className="lock-icon" />
                  <span>No login or password required. Your contact info is strictly used for this appointment.</span>
                </div>

                {/* Submit Button */}
                <div className="form-action-buttons">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={18} className="spinner-icon" />
                        <span>Confirming Appointment...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Appointment Booking Summary Card */}
          <div className="booking-summary-panel">
            <div className="summary-card">
              <div className="summary-card-header">
                <h3 className="summary-title">Appointment Summary</h3>
                <span className="summary-badge">
                  <ShieldCheck size={13} /> Step 5 Review
                </span>
              </div>

              {/* Specialist Overview */}
              <div className="summary-provider-row">
                <div className="summary-avatar">
                  {selectedProvider?.name?.replace(/^Dr\.\s+/i, '').slice(0, 2).toUpperCase() || 'PR'}
                </div>
                <div className="summary-provider-info">
                  <h4 className="summary-provider-name">{selectedProvider?.name}</h4>
                  <p className="summary-provider-spec">{selectedProvider?.specialization}</p>
                  <span className="summary-category-pill">
                    <IconComponent size={12} />
                    <span>{selectedCategory?.name}</span>
                  </span>
                </div>
              </div>

              <div className="summary-divider" />

              {/* Appointment Key Items */}
              <div className="summary-items-list">
                <div className="summary-item">
                  <div className="summary-item-icon date">
                    <Calendar size={16} />
                  </div>
                  <div className="summary-item-content">
                    <span className="summary-item-label">Appointment Date</span>
                    <span className="summary-item-val">{formatDisplayDate(selectedDate)}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-item-icon time">
                    <Clock size={16} />
                  </div>
                  <div className="summary-item-content">
                    <span className="summary-item-label">Reserved Time Slot</span>
                    <span className="summary-item-val highlight-time">
                      {selectedSlot?.formatted || `${selectedSlot?.start_time} - ${selectedSlot?.end_time}`}
                    </span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-item-icon location">
                    <MapPin size={16} />
                  </div>
                  <div className="summary-item-content">
                    <span className="summary-item-label">Consultation Location</span>
                    <span className="summary-item-val">
                      {selectedProvider?.location}, {selectedProvider?.city}{selectedProvider?.state ? `, ${selectedProvider?.state}` : ''}
                    </span>
                    <span className="summary-item-sub">Requested Area: {selectedLocation || selectedProvider?.location}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-item-icon fee">
                    <CreditCard size={16} />
                  </div>
                  <div className="summary-item-content">
                    <span className="summary-item-label">Consultation Fee</span>
                    <span className="summary-item-val fee-val">₹{selectedProvider?.consultation_fee}</span>
                    <span className="summary-item-sub">Payable directly at the clinic / venue</span>
                  </div>
                </div>
              </div>

              <div className="summary-divider" />

              {/* Dynamic Live Customer Preview */}
              <div className="customer-preview-box">
                <span className="customer-preview-title">Booking Reserved For:</span>
                <div className="customer-preview-data">
                  <div className="preview-row">
                    <span className="preview-lbl">Name:</span>
                    <strong className="preview-val">{formData.name.trim() || '—'}</strong>
                  </div>
                  <div className="preview-row">
                    <span className="preview-lbl">Mobile:</span>
                    <span className="preview-val">{formData.phone.trim() || '—'}</span>
                  </div>
                  {formData.email.trim() && (
                    <div className="preview-row">
                      <span className="preview-lbl">Email:</span>
                      <span className="preview-val">{formData.email.trim()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modify Slot Shortcut */}
              <button
                type="button"
                className="btn-modify-slot"
                onClick={onBackToSlots}
                disabled={isSubmitting}
              >
                <span>Change Time Slot or Date</span>
                <ArrowLeft size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
