import { useState, useEffect, useMemo } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Star,
  RefreshCw,
  AlertCircle,
  Briefcase,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  Sparkle,
  Search,
  FilterX,
  Clock
} from 'lucide-react'
import ProviderFilters from './ProviderFilters'

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

export default function ProviderDiscovery({
  selectedCategory,
  selectedLocation,
  selectedState = '',
  selectedCity = '',
  selectedLocality = '',
  selectedDate,
  onSelectProvider,
  onBackToLocationDate
}) {
  const [providers, setProviders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Module 6 & Time Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [minExperience, setMinExperience] = useState(0)
  const [sortBy, setSortBy] = useState('recommended')
  const [timeFilter, setTimeFilter] = useState('all') // 'all' | 'morning' | 'afternoon' | 'evening'

  // Provider slots state fetched via Module 7 API for selectedDate
  const [providerSlotsMap, setProviderSlotsMap] = useState({})
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  const categoryId = selectedCategory?.id
  const locationQuery = selectedLocation?.trim() || ''

  const fetchProviders = () => {
    if (!categoryId) return

    setIsLoading(true)
    setError(null)
    setProviders([])
    setProviderSlotsMap({})

    const queryParams = new URLSearchParams()
    queryParams.append('category_id', categoryId)

    if (selectedCity && selectedCity.trim()) {
      queryParams.append('city', selectedCity.trim())
    }
    if (selectedState && selectedState.trim()) {
      queryParams.append('state', selectedState.trim())
    }
    if (selectedLocality && selectedLocality.trim()) {
      queryParams.append('location', selectedLocality.trim())
    } else if (locationQuery && !selectedCity) {
      queryParams.append('location', locationQuery)
    }

    const url = `${API_BASE_URL}/providers?${queryParams.toString()}`

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.providers)) {
          setProviders(data.providers)
        } else {
          throw new Error(data.message || 'Failed to fetch providers.')
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Provider fetch error:', err)
        setError(err.message || 'Unable to connect to the provider discovery service.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchProviders()
  }, [categoryId, selectedCity, selectedState, selectedLocality, locationQuery])

  // Fetch actual appointment slots for all discovered providers on selectedDate using Module 7 API
  useEffect(() => {
    if (!providers || providers.length === 0 || !selectedDate) {
      setProviderSlotsMap({})
      return
    }

    let isMounted = true
    setIsLoadingSlots(true)

    Promise.all(
      providers.map((p) =>
        fetch(`${API_BASE_URL}/providers/${p.id}/slots?date=${selectedDate}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((slotData) => ({
            id: p.id,
            slots: slotData?.status === 'success' && Array.isArray(slotData.slots) ? slotData.slots : []
          }))
          .catch(() => ({ id: p.id, slots: [] }))
      )
    ).then((results) => {
      if (isMounted) {
        const slotsMap = {}
        results.forEach((item) => {
          slotsMap[item.id] = item.slots
        })
        setProviderSlotsMap(slotsMap)
        setIsLoadingSlots(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [providers, selectedDate])

  // Clear all filters, search query, reset time filter, and reset sorting
  const handleClearAllFilters = () => {
    setSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
    setTimeFilter('all')
    setMinRating(0)
    setMinExperience(0)
    setSortBy('recommended')
  }

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    (timeFilter && timeFilter !== 'all') ||
    minRating > 0 ||
    minExperience > 0 ||
    sortBy !== 'recommended'
  )

  // Module 6 & Time Filter: Client-Side Derived Filtered and Sorted Providers
  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers]

    // 1. Search Query: Match Name or Specialization (case-insensitive partial match)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q)
        const specMatch = p.specialization?.toLowerCase().includes(q)
        return nameMatch || specMatch
      })
    }

    // 2. Price Range (Consultation Fee)
    const numMin = minPrice !== '' ? Number(minPrice) : null
    const numMax = maxPrice !== '' ? Number(maxPrice) : null

    if (numMin !== null && numMax !== null && numMin <= numMax) {
      result = result.filter((p) => p.consultation_fee >= numMin && p.consultation_fee <= numMax)
    } else if (numMin !== null && numMax === null) {
      result = result.filter((p) => p.consultation_fee >= numMin)
    } else if (numMax !== null && numMin === null) {
      result = result.filter((p) => p.consultation_fee <= numMax)
    }

    // 3. Time Availability Filter: Filter providers with at least one available slot in range
    if (timeFilter && timeFilter !== 'all') {
      result = result.filter((p) => {
        const slots = providerSlotsMap[p.id] || []
        return slots.some((slot) => {
          const st = slot.start_time
          if (timeFilter === 'morning') return st >= '06:00' && st < '12:00'
          if (timeFilter === 'afternoon') return st >= '12:00' && st < '17:00'
          if (timeFilter === 'evening') return st >= '17:00' && st < '22:00'
          return true
        })
      })
    }

    // 4. Minimum Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating)
    }

    // 5. Minimum Experience Filter
    if (minExperience > 0) {
      result = result.filter((p) => p.experience_years >= minExperience)
    }

    // 6. Sorting Options
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.consultation_fee - b.consultation_fee)
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.consultation_fee - a.consultation_fee)
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'experience-desc') {
      result.sort((a, b) => b.experience_years - a.experience_years)
    }
    // 'recommended' uses original API ordering

    return result
  }, [providers, providerSlotsMap, searchQuery, minPrice, maxPrice, timeFilter, minRating, minExperience, sortBy])

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
          <div className="workflow-step completed">
            <span className="step-circle">✓</span>
            <span className="step-label">Location & Date</span>
          </div>
          <div className="workflow-divider active" />
          <div className="workflow-step active">
            <span className="step-circle">3</span>
            <span className="step-label">Find Provider</span>
          </div>
          <div className="workflow-divider" />
          <div className="workflow-step pending">
            <span className="step-circle">4</span>
            <span className="step-label">Select Time Slot</span>
          </div>
        </div>

        {/* Selected Criteria Summary Header */}
        <div className="discovery-criteria-bar">
          <div className="criteria-summary-group">
            <div className="criteria-chip">
              <span className="chip-label">Category:</span>
              <div className="chip-value">
                <IconComponent size={16} className="text-primary" />
                <strong>{selectedCategory?.name}</strong>
              </div>
            </div>

            <div className="criteria-chip">
              <span className="chip-label">Location:</span>
              <div className="chip-value">
                <MapPin size={16} className="text-amber" />
                <span>{selectedLocation || 'Any Location'}</span>
              </div>
            </div>

            <div className="criteria-chip">
              <span className="chip-label">Date:</span>
              <div className="chip-value">
                <Calendar size={16} className="text-indigo" />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onBackToLocationDate}
          >
            <ArrowLeft size={14} />
            <span>Modify Location / Date</span>
          </button>
        </div>

        {/* Section Heading */}
        <div className="discovery-header">
          <div className="discovery-header-text">
            <h2 className="discovery-title">
              Available {selectedCategory?.name || 'Service'} Specialists
            </h2>
            <p className="discovery-subtitle">
              Verified professionals ready for appointments in <strong>{selectedLocation || 'your area'}</strong> on <strong>{formatDisplayDate(selectedDate)}</strong>.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="services-status-card loading-state">
            <RefreshCw size={32} className="spinner-icon" />
            <h4 style={{ color: 'var(--text-heading)', marginTop: '0.5rem' }}>Discovering Available Providers</h4>
            <p className="status-text">
              Searching database for certified {selectedCategory?.name} specialists near "{selectedLocation}"...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="services-status-card error-state">
            <AlertCircle size={32} className="error-icon" />
            <div className="error-details">
              <h4>Failed to Discover Providers</h4>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={fetchProviders}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Location-level Empty State (Zero providers in DB for this location) */}
        {!isLoading && !error && providers.length === 0 && (
          <div className="services-status-card empty-state">
            <Search size={36} style={{ color: 'var(--text-muted)' }} />
            <h4 style={{ color: 'var(--text-heading)' }}>No Specialists Found</h4>
            <p className="status-text">
              We couldn't find any registered {selectedCategory?.name} specialists in{' '}
              <strong>
                {selectedCity
                  ? `${selectedCity}, ${selectedState}`
                  : selectedLocation || 'this location'}
              </strong>
              .
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
              We have verified and active specialists available across major hubs in India, including{' '}
              <strong>Delhi, Mumbai, Bengaluru, Jaipur, Pune, Hyderabad, Dehradun</strong>, and more. You can change your location or choose another nearby city.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onBackToLocationDate}
              style={{ marginTop: '0.5rem' }}
            >
              <MapPin size={14} />
              <span>Change Location</span>
            </button>
          </div>
        )}

        {/* Providers Available: Render Search & Filter Controls */}
        {!isLoading && !error && providers.length > 0 && (
          <>
            {/* Module 6: Search, Filters & Sorting Controls */}
            <ProviderFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              timeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
              minRating={minRating}
              onMinRatingChange={setMinRating}
              minExperience={minExperience}
              onMinExperienceChange={setMinExperience}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onClearAllFilters={handleClearAllFilters}
              totalCount={providers.length}
              filteredCount={filteredAndSortedProviders.length}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Filtered Empty State (Providers exist in location, but 0 match active filters) */}
            {filteredAndSortedProviders.length === 0 && (
              <div className="services-status-card empty-state">
                <FilterX size={36} style={{ color: 'var(--text-muted)' }} />
                <h4 style={{ color: 'var(--text-heading)' }}>No Providers Match Your Filters</h4>
                <p className="status-text">
                  No providers match your search or filters. Try adjusting your fee range, minimum rating, or clearing your search term.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleClearAllFilters}
                  style={{ marginTop: '0.5rem' }}
                >
                  <RefreshCw size={14} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}

            {/* Providers Grid */}
            {filteredAndSortedProviders.length > 0 && (
              <div className="providers-grid">
                {filteredAndSortedProviders.map((provider) => (
                  <div key={provider.id} className="provider-card">
                    {/* Provider Card Header */}
                    <div className="provider-card-header">
                      <div className="provider-avatar-wrapper">
                        <div className="provider-avatar">
                          <span>{getInitials(provider.name)}</span>
                        </div>
                        <span className="provider-status-dot online" title="Available for booking" />
                      </div>

                      <div className="provider-header-meta">
                        <div className="provider-title-row">
                          <h3 className="provider-name">{provider.name}</h3>
                          <span className="badge-verified-small">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        </div>
                        <p className="provider-specialization">{provider.specialization}</p>
                        <div className="provider-rating-row">
                          <div className="star-rating">
                            <Star size={14} fill="#eab308" color="#eab308" />
                            <span className="rating-num">{provider.rating.toFixed(1)}</span>
                          </div>
                          <span className="reviews-count">({provider.total_reviews} reviews)</span>
                          <span className="dot-separator">•</span>
                          <span className="experience-badge">
                            <Briefcase size={12} /> {provider.experience_years} yrs exp
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Provider Card Body */}
                    <div className="provider-card-body">
                      <p className="provider-description">{provider.description}</p>

                      <div className="provider-tags-row">
                        <div className="provider-tag location-tag">
                          <MapPin size={13} />
                          <span>{provider.location}, {provider.city}{provider.state ? `, ${provider.state}` : ''}</span>
                        </div>
                        <div className="provider-tag fee-tag">
                          <CreditCard size={13} />
                          <span>₹{provider.consultation_fee} Consultation Fee</span>
                        </div>
                        {providerSlotsMap[provider.id] && (
                          <div className="provider-tag slots-tag">
                            <Clock size={13} />
                            <span>
                              {timeFilter !== 'all' ? (
                                `${(providerSlotsMap[provider.id] || []).filter(s => {
                                  const st = s.start_time
                                  if (timeFilter === 'morning') return st >= '06:00' && st < '12:00'
                                  if (timeFilter === 'afternoon') return st >= '12:00' && st < '17:00'
                                  if (timeFilter === 'evening') return st >= '17:00' && st < '22:00'
                                  return true
                                }).length} ${timeFilter} slot${(providerSlotsMap[provider.id] || []).filter(s => {
                                  const st = s.start_time
                                  if (timeFilter === 'morning') return st >= '06:00' && st < '12:00'
                                  if (timeFilter === 'afternoon') return st >= '12:00' && st < '17:00'
                                  if (timeFilter === 'evening') return st >= '17:00' && st < '22:00'
                                  return true
                                }).length === 1 ? '' : 's'} available`
                              ) : (
                                `${(providerSlotsMap[provider.id] || []).length} available slot${(providerSlotsMap[provider.id] || []).length === 1 ? '' : 's'}`
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Provider Card Footer */}
                    <div className="provider-card-footer">
                      <div className="date-reminder">
                        <Calendar size={13} />
                        <span>Booking for: {formatDisplayDate(selectedDate)}</span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={() => onSelectProvider(provider)}
                      >
                        <span>View Provider</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
