import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/api'
import {
  Stethoscope,
  Smile,
  Scissors,
  Dumbbell,
  Sparkles,
  Activity,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkle,
  Check
} from 'lucide-react'

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

export default function Services({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = () => {
    setIsLoading(true)
    setError(null)

    fetch(`${API_BASE_URL}/categories`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.categories)) {
          setCategories(data.categories)
        } else {
          throw new Error(data.message || 'Failed to load categories.')
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err)
        setError(err.message || 'Unable to load service categories. Please ensure the backend is running.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <section id="services" className="services-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <span className="section-eyebrow">Service Categories</span>
          <h2 className="section-title">Explore Services</h2>
          <p className="section-subtitle">
            Find the right professional for your needs.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="services-status-card loading-state">
            <RefreshCw size={28} className="spinner-icon" />
            <p className="status-text">Loading available service categories from database...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="services-status-card error-state">
            <AlertCircle size={28} className="error-icon" />
            <div className="error-details">
              <h4>Failed to Load Categories</h4>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={fetchCategories}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && categories.length === 0 && (
          <div className="services-status-card empty-state">
            <p className="status-text">No service categories are currently available.</p>
          </div>
        )}

        {/* Categories Grid (Loaded State) */}
        {!isLoading && !error && categories.length > 0 && (
          <div className="services-grid">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.icon)
              const isSelected = selectedCategory?.id === category.id

              return (
                <div
                  key={category.id}
                  className={`service-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectCategory && onSelectCategory(category)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectCategory && onSelectCategory(category)
                    }
                  }}
                >
                  <div className="service-card-header">
                    <div className="service-icon-box">
                      <IconComponent className="service-icon" size={28} />
                    </div>
                    {isSelected ? (
                      <span className="service-badge selected-badge">
                        <Check size={12} /> Selected
                      </span>
                    ) : (
                      <span className="service-badge">Available</span>
                    )}
                  </div>

                  <div className="service-card-body">
                    <h3 className="service-card-title">{category.name}</h3>
                    <p className="service-card-description">{category.description}</p>
                  </div>

                  <div className="service-card-footer">
                    <span className="service-cta-text">
                      {isSelected ? 'Selected Category' : 'Book Specialist'}
                    </span>
                    <ArrowRight size={16} className="service-arrow-icon" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
