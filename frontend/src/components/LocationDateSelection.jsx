import { useState, useEffect, useRef, useMemo } from 'react'
import {
  MapPin,
  Calendar,
  X,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  Sparkle,
  Clock,
  Search,
  ChevronDown,
  Building2,
  Compass,
  RotateCcw
} from 'lucide-react'
import {
  INDIAN_STATES_AND_UTS,
  getCitiesForState,
  searchCities,
  getLocalitiesForCity,
  DEFAULT_STATE,
  DEFAULT_CITY
} from '../data/indiaLocations'

// Map backend icon string to Lucide React component
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

// Get today's date in YYYY-MM-DD format for min attribute
const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format YYYY-MM-DD date for clean display
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Helper to parse location inputs
const parseInitialValues = (fullLoc, initState, initCity, initLocality) => {
  if (initState && initCity) {
    return {
      state: initState,
      city: initCity,
      locality: initLocality || ''
    }
  }
  if (fullLoc) {
    const parts = fullLoc.split(',').map((p) => p.trim())
    if (parts.length >= 3) {
      return { locality: parts[0], city: parts[1], state: parts[2] }
    } else if (parts.length === 2) {
      const isState = INDIAN_STATES_AND_UTS.some(
        (s) => s.name.toLowerCase() === parts[1].toLowerCase()
      )
      if (isState) {
        return { locality: '', city: parts[0], state: parts[1] }
      } else {
        return { locality: parts[0], city: parts[1], state: DEFAULT_STATE }
      }
    } else if (parts.length === 1 && parts[0]) {
      return { locality: '', city: parts[0], state: DEFAULT_STATE }
    }
  }
  return {
    state: DEFAULT_STATE,
    city: DEFAULT_CITY,
    locality: ''
  }
}

export default function LocationDateSelection({
  selectedCategory,
  initialLocation = '',
  initialState = '',
  initialCity = '',
  initialLocality = '',
  initialDate = '',
  onContinue,
  onBackToCategories
}) {
  const initialVals = useMemo(
    () => parseInitialValues(initialLocation, initialState, initialCity, initialLocality),
    [initialLocation, initialState, initialCity, initialLocality]
  )

  const [selectedState, setSelectedState] = useState(initialVals.state)
  const [selectedCity, setSelectedCity] = useState(initialVals.city)
  const [citySearchQuery, setCitySearchQuery] = useState(initialVals.city)
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false)
  const [locality, setLocality] = useState(initialVals.locality)
  const [date, setDate] = useState(initialDate)
  const [errors, setErrors] = useState({})

  const cityDropdownRef = useRef(null)
  const todayStr = getTodayString()

  // All available cities for the currently selected state
  const citiesInState = useMemo(() => {
    return getCitiesForState(selectedState)
  }, [selectedState])

  // Filtered cities based on user search query
  const filteredCities = useMemo(() => {
    if (!citySearchQuery || !citySearchQuery.trim()) {
      return citiesInState
    }
    return searchCities(selectedState, citySearchQuery)
  }, [selectedState, citiesInState, citySearchQuery])

  // Known localities for the selected city
  const knownLocalities = useMemo(() => {
    return getLocalitiesForCity(selectedCity)
  }, [selectedCity])

  // Split States and Union Territories for optgroup rendering
  const statesList = useMemo(() => {
    return INDIAN_STATES_AND_UTS.filter((item) => item.type === 'State')
  }, [])

  const utsList = useMemo(() => {
    return INDIAN_STATES_AND_UTS.filter((item) => item.type === 'Union Territory')
  }, [])

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setIsCityDropdownOpen(false)
        // If user typed something and closed without clicking, check if matches any city
        if (citySearchQuery && !selectedCity) {
          const match = citiesInState.find(
            (c) => c.toLowerCase() === citySearchQuery.trim().toLowerCase()
          )
          if (match) {
            setSelectedCity(match)
            setCitySearchQuery(match)
          } else if (citySearchQuery.trim()) {
            setSelectedCity(citySearchQuery.trim())
          }
        } else if (!citySearchQuery && selectedCity) {
          setCitySearchQuery(selectedCity)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [citySearchQuery, selectedCity, citiesInState])

  // Handle state change
  const handleStateChange = (e) => {
    const newState = e.target.value
    setSelectedState(newState)
    setSelectedCity('')
    setCitySearchQuery('')
    setLocality('')
    setIsCityDropdownOpen(false)
    if (errors.state) {
      setErrors((prev) => ({ ...prev, state: null }))
    }
  }

  // Handle city search input
  const handleCitySearchChange = (e) => {
    const val = e.target.value
    setCitySearchQuery(val)
    setSelectedCity(val)
    setIsCityDropdownOpen(true)
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: null }))
    }
  }

  // Handle city selection from dropdown
  const handleSelectCity = (city) => {
    setSelectedCity(city)
    setCitySearchQuery(city)
    setIsCityDropdownOpen(false)
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: null }))
    }
  }

  // Clear city input
  const handleClearCity = () => {
    setSelectedCity('')
    setCitySearchQuery('')
    setLocality('')
    setIsCityDropdownOpen(true)
  }

  // Handle locality change
  const handleLocalityChange = (e) => {
    setLocality(e.target.value)
  }

  // Clear locality input
  const handleClearLocality = () => {
    setLocality('')
  }

  // Quick locality chip click
  const handleLocalityChipClick = (chip) => {
    setLocality(chip)
  }

  // Reset to default location (Dehradun, Uttarakhand)
  const handleResetToDefault = () => {
    setSelectedState(DEFAULT_STATE)
    setSelectedCity(DEFAULT_CITY)
    setCitySearchQuery(DEFAULT_CITY)
    setLocality('')
    setErrors({})
    setIsCityDropdownOpen(false)
  }

  // Handle date change
  const handleDateChange = (e) => {
    setDate(e.target.value)
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: null }))
    }
  }

  // Form Validation & Submission
  const validateAndSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!selectedState || !selectedState.trim()) {
      newErrors.state = 'Please select your State or Union Territory.'
    }

    const trimmedCity = (selectedCity || citySearchQuery || '').trim()
    if (!trimmedCity) {
      newErrors.city = 'Please select or enter your preferred City or Town.'
    }

    if (!date) {
      newErrors.date = 'Please select your preferred appointment date.'
    } else if (date < todayStr) {
      newErrors.date = 'Appointment date cannot be in the past.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Construct unified location string for backward compatibility
    const trimmedLocality = locality.trim()
    const formattedLocation = trimmedLocality
      ? `${trimmedLocality}, ${trimmedCity}, ${selectedState}`
      : `${trimmedCity}, ${selectedState}`

    onContinue({
      location: formattedLocation,
      state: selectedState,
      city: trimmedCity,
      locality: trimmedLocality,
      date: date
    })
  }

  const IconComponent = selectedCategory ? getCategoryIcon(selectedCategory.icon) : Sparkle

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
          <div className="workflow-step active">
            <span className="step-circle">2</span>
            <span className="step-label">Location & Date</span>
          </div>
          <div className="workflow-divider" />
          <div className="workflow-step pending">
            <span className="step-circle">3</span>
            <span className="step-label">Find Provider</span>
          </div>
          <div className="workflow-divider" />
          <div className="workflow-step pending">
            <span className="step-circle">4</span>
            <span className="step-label">Select Time Slot</span>
          </div>
        </div>

        {/* Selected Category Summary Bar */}
        <div className="selected-category-summary">
          <div className="summary-left">
            <div className="summary-icon-box">
              <IconComponent size={24} />
            </div>
            <div>
              <span className="summary-eyebrow">Selected Service</span>
              <h3 className="summary-title">{selectedCategory?.name || 'Service'}</h3>
              <p className="summary-desc">{selectedCategory?.description}</p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBackToCategories}
          >
            <ArrowLeft size={14} />
            <span>Change Category</span>
          </button>
        </div>

        {/* Location and Date Form Card */}
        <form className="booking-form-card" onSubmit={validateAndSubmit} noValidate>
          <div className="form-card-header">
            <div className="form-header-badge">
              <Compass size={14} />
              <span>Pan-India Coverage</span>
            </div>
            <h2 className="form-card-title">Where & When would you like your appointment?</h2>
            <p className="form-card-subtitle">
              Select your Indian State or Union Territory, choose your city or town, and pick a preferred appointment date.
            </p>
          </div>

          <div className="form-fields-grid">
            {/* Location Selection Sub-section */}
            <div className="location-section-container">
              <div className="location-section-header">
                <span className="location-section-title">
                  <MapPin size={17} className="title-icon" />
                  <span>1. Appointment Location (India)</span>
                </span>
                {(selectedState !== DEFAULT_STATE || selectedCity !== DEFAULT_CITY) && (
                  <button
                    type="button"
                    className="reset-location-btn"
                    onClick={handleResetToDefault}
                    title="Reset to Dehradun, Uttarakhand"
                  >
                    <RotateCcw size={13} />
                    <span>Reset to Dehradun</span>
                  </button>
                )}
              </div>

              <div className="location-inputs-grid">
                {/* 1A. State / Union Territory Dropdown */}
                <div className={`form-group ${errors.state ? 'has-error' : ''}`}>
                  <label htmlFor="state-select" className="form-label">
                    <Compass size={15} className="label-icon" />
                    <span>State / Union Territory *</span>
                  </label>
                  <div className="select-with-icon-wrapper">
                    <Compass size={18} className="field-leading-icon" />
                    <select
                      id="state-select"
                      className="form-input form-select"
                      value={selectedState}
                      onChange={handleStateChange}
                    >
                      <option value="">-- Select State or UT --</option>
                      <optgroup label="States (28)">
                        {statesList.map((state) => (
                          <option key={state.name} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Union Territories (8)">
                        {utsList.map((ut) => (
                          <option key={ut.name} value={ut.name}>
                            {ut.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <ChevronDown size={16} className="select-trailing-icon" />
                  </div>
                  {errors.state && (
                    <div className="form-error-message">
                      <AlertCircle size={14} />
                      <span>{errors.state}</span>
                    </div>
                  )}
                </div>

                {/* 1B. Searchable City Dropdown */}
                <div
                  className={`form-group ${errors.city ? 'has-error' : ''}`}
                  ref={cityDropdownRef}
                >
                  <label htmlFor="city-input" className="form-label">
                    <Building2 size={15} className="label-icon" />
                    <span>City / Town *</span>
                  </label>
                  <div className="city-search-wrapper">
                    <div className="input-with-icon-wrapper">
                      <Search size={18} className="field-leading-icon" />
                      <input
                        id="city-input"
                        type="text"
                        className="form-input"
                        placeholder={
                          selectedState
                            ? `Search or type city in ${selectedState}...`
                            : 'First select a state above'
                        }
                        value={citySearchQuery}
                        onChange={handleCitySearchChange}
                        onFocus={() => setIsCityDropdownOpen(true)}
                        disabled={!selectedState}
                        autoComplete="off"
                      />
                      {citySearchQuery.length > 0 && (
                        <button
                          type="button"
                          className="clear-input-btn"
                          onClick={handleClearCity}
                          aria-label="Clear city input"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* City Suggestions Dropdown */}
                    {isCityDropdownOpen && selectedState && (
                      <div className="city-dropdown-menu">
                        <div className="city-dropdown-header">
                          <span>
                            {citiesInState.length} cities available in {selectedState}
                          </span>
                        </div>
                        <ul className="city-dropdown-list">
                          {filteredCities.length > 0 ? (
                            filteredCities.map((cityName) => (
                              <li
                                key={cityName}
                                className={`city-dropdown-item ${
                                  selectedCity.toLowerCase() === cityName.toLowerCase() ? 'active' : ''
                                }`}
                                onClick={() => handleSelectCity(cityName)}
                              >
                                <span className="city-name">{cityName}</span>
                                {selectedCity.toLowerCase() === cityName.toLowerCase() && (
                                  <span className="selected-indicator">✓</span>
                                )}
                              </li>
                            ))
                          ) : (
                            <li
                              className="city-dropdown-item custom-option"
                              onClick={() => handleSelectCity(citySearchQuery.trim())}
                            >
                              <span>Use "<strong>{citySearchQuery.trim()}</strong>"</span>
                              <span className="custom-hint">Custom town</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  {errors.city && (
                    <div className="form-error-message">
                      <AlertCircle size={14} />
                      <span>{errors.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1C. Optional Locality / Area / Landmark Input */}
              <div className="form-group locality-group">
                <label htmlFor="locality-input" className="form-label">
                  <MapPin size={15} className="label-icon" />
                  <span>Locality, Area, or Landmark (Optional)</span>
                </label>
                <div className="input-with-icon-wrapper">
                  <MapPin size={18} className="field-leading-icon" />
                  <input
                    id="locality-input"
                    type="text"
                    className="form-input"
                    placeholder={
                      selectedCity
                        ? `e.g. Rajpur Road, Prem Nagar, Sector 15 (${selectedCity})`
                        : 'e.g. Rajpur Road, Prem Nagar, Sector 15'
                    }
                    value={locality}
                    onChange={handleLocalityChange}
                    autoComplete="off"
                  />
                  {locality.length > 0 && (
                    <button
                      type="button"
                      className="clear-input-btn"
                      onClick={handleClearLocality}
                      aria-label="Clear locality input"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Quick Locality Suggestions for key cities (e.g. Dehradun) */}
                {knownLocalities.length > 0 && (
                  <div className="location-suggestions">
                    <span className="suggestions-label">
                      Suggestions for {selectedCity}:
                    </span>
                    <div className="chips-row">
                      {knownLocalities.map((area) => (
                        <button
                          key={area}
                          type="button"
                          className={`chip-btn ${locality === area ? 'active' : ''}`}
                          onClick={() => handleLocalityChipClick(area)}
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Location Summary Preview */}
              {selectedCity && selectedState && (
                <div className="selected-location-summary-pill">
                  <MapPin size={15} className="pill-icon" />
                  <span>
                    Selected Location:{' '}
                    <strong>
                      {locality.trim() ? `${locality.trim()}, ` : ''}
                      {selectedCity}, {selectedState}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* 2. Date Selection Field */}
            <div className={`form-group ${errors.date ? 'has-error' : ''}`}>
              <label htmlFor="date-input" className="form-label">
                <Calendar size={16} className="label-icon" />
                <span>2. Preferred Appointment Date *</span>
              </label>
              <div className="input-with-icon-wrapper">
                <Calendar size={18} className="field-leading-icon" />
                <input
                  id="date-input"
                  type="date"
                  className="form-input"
                  min={todayStr}
                  value={date}
                  onChange={handleDateChange}
                />
              </div>

              {errors.date && (
                <div className="form-error-message">
                  <AlertCircle size={14} />
                  <span>{errors.date}</span>
                </div>
              )}

              {/* Formatted Date Display & Notice */}
              {date ? (
                <div className="selected-date-preview">
                  <CheckCircle2 size={16} className="preview-check-icon" />
                  <span>Selected Date: <strong>{formatDisplayDate(date)}</strong></span>
                </div>
              ) : (
                <p className="field-help-text">
                  Choose today or any upcoming date. Past dates are automatically disabled.
                </p>
              )}

              <div className="no-time-notice">
                <Clock size={15} />
                <span>Note: Appointment time slots will be selected in the provider step.</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-row">
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={onBackToCategories}
            >
              <ArrowLeft size={18} />
              <span>Back to Categories</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
            >
              <span>Continue to Find Providers</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
