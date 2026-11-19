import { useState } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Star,
  Briefcase,
  CreditCard,
  RotateCcw,
  AlertCircle,
  Clock
} from 'lucide-react'

export default function ProviderFilters({
  searchQuery,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  timeFilter = 'all',
  onTimeFilterChange,
  minRating,
  onMinRatingChange,
  minExperience,
  onMinExperienceChange,
  sortBy,
  onSortChange,
  onClearAllFilters,
  totalCount,
  filteredCount,
  hasActiveFilters
}) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const numMin = minPrice !== '' ? Number(minPrice) : null
  const numMax = maxPrice !== '' ? Number(maxPrice) : null
  const isPriceRangeInvalid = numMin !== null && numMax !== null && numMin > numMax

  return (
    <div className="provider-filters-container">
      {/* Search Bar & Primary Sort Row */}
      <div className="search-sort-bar">
        {/* Search Input Field */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-leading-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by provider name or specialization..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search by provider name or specialization"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sorting Dropdown (Desktop & Tablet) */}
        <div className="sort-dropdown-wrapper">
          <label htmlFor="sort-select" className="sort-label">
            <ArrowUpDown size={15} />
            <span>Sort By:</span>
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="recommended">Recommended (Default)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Rating: High to Low</option>
            <option value="experience-desc">Experience: High to Low</option>
          </select>
        </div>

        {/* Mobile Toggle Filters Button */}
        <button
          type="button"
          className={`mobile-filter-toggle-btn ${hasActiveFilters ? 'has-active' : ''}`}
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          aria-expanded={isMobileFiltersOpen}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="active-dot" />}
        </button>
      </div>

      {/* Filter Controls Panel */}
      <div className={`filters-panel ${isMobileFiltersOpen ? 'mobile-open' : ''}`}>
        <div className="filters-grid">
          {/* 1. Consultation Fee Range */}
          <div className="filter-group price-filter-group">
            <label className="filter-group-label">
              <CreditCard size={14} className="filter-icon" />
              <span>Consultation Fee (₹)</span>
            </label>
            <div className="price-inputs-row">
              <input
                type="number"
                min="0"
                step="50"
                className={`filter-input price-input ${isPriceRangeInvalid ? 'input-error' : ''}`}
                placeholder="Min Fee"
                value={minPrice}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '' || Number(val) >= 0) {
                    onMinPriceChange(val)
                  }
                }}
              />
              <span className="price-separator">to</span>
              <input
                type="number"
                min="0"
                step="50"
                className={`filter-input price-input ${isPriceRangeInvalid ? 'input-error' : ''}`}
                placeholder="Max Fee"
                value={maxPrice}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === '' || Number(val) >= 0) {
                    onMaxPriceChange(val)
                  }
                }}
              />
            </div>
            {isPriceRangeInvalid && (
              <span className="filter-warning-text">
                <AlertCircle size={12} /> Min fee cannot exceed Max fee
              </span>
            )}
          </div>

          {/* 2. Available Time Filter */}
          <div className="filter-group">
            <label htmlFor="time-filter" className="filter-group-label">
              <Clock size={14} className="filter-icon" />
              <span>Available Time</span>
            </label>
            <select
              id="time-filter"
              className="filter-select"
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value)}
            >
              <option value="all">All Times</option>
              <option value="morning">Morning (6:00 AM – 12:00 PM)</option>
              <option value="afternoon">Afternoon (12:00 PM – 5:00 PM)</option>
              <option value="evening">Evening (5:00 PM – 10:00 PM)</option>
            </select>
          </div>

          {/* 3. Minimum Rating Filter */}
          <div className="filter-group">
            <label htmlFor="rating-filter" className="filter-group-label">
              <Star size={14} className="filter-icon star-icon" />
              <span>Minimum Rating</span>
            </label>
            <select
              id="rating-filter"
              className="filter-select"
              value={minRating}
              onChange={(e) => onMinRatingChange(Number(e.target.value))}
            >
              <option value="0">All Ratings</option>
              <option value="3.0">3.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* 3. Minimum Experience Filter */}
          <div className="filter-group">
            <label htmlFor="experience-filter" className="filter-group-label">
              <Briefcase size={14} className="filter-icon" />
              <span>Experience Level</span>
            </label>
            <select
              id="experience-filter"
              className="filter-select"
              value={minExperience}
              onChange={(e) => onMinExperienceChange(Number(e.target.value))}
            >
              <option value="0">Any Experience</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
            </select>
          </div>

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <div className="filter-group clear-group">
              <button
                type="button"
                className="btn-clear-filters"
                onClick={onClearAllFilters}
                title="Reset all active search and filter criteria"
              >
                <RotateCcw size={14} />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Badges & Results Counter Bar */}
      <div className="results-status-bar">
        <div className="results-counter">
          <span>Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> available specialists</span>
          {hasActiveFilters && <span className="filtered-indicator">(filtered)</span>}
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="active-filter-pills">
            {searchQuery && (
              <span className="filter-pill">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Remove search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {(minPrice !== '' || maxPrice !== '') && (
              <span className="filter-pill">
                Fee: {minPrice ? `₹${minPrice}` : '₹0'} – {maxPrice ? `₹${maxPrice}` : 'Any'}
                <button
                  type="button"
                  onClick={() => {
                    onMinPriceChange('')
                    onMaxPriceChange('')
                  }}
                  aria-label="Remove price filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {timeFilter && timeFilter !== 'all' && (
              <span className="filter-pill">
                Time: {
                  timeFilter === 'morning' ? 'Morning (6 AM - 12 PM)' :
                  timeFilter === 'afternoon' ? 'Afternoon (12 PM - 5 PM)' :
                  'Evening (5 PM - 10 PM)'
                }
                <button
                  type="button"
                  onClick={() => onTimeFilterChange('all')}
                  aria-label="Remove time filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {minRating > 0 && (
              <span className="filter-pill">
                Rating: {minRating}+ ★
                <button
                  type="button"
                  onClick={() => onMinRatingChange(0)}
                  aria-label="Remove rating filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {minExperience > 0 && (
              <span className="filter-pill">
                Experience: {minExperience}+ yrs
                <button
                  type="button"
                  onClick={() => onMinExperienceChange(0)}
                  aria-label="Remove experience filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {sortBy !== 'recommended' && (
              <span className="filter-pill sort-pill">
                Sort: {
                  sortBy === 'price-asc' ? 'Price Low-High' :
                  sortBy === 'price-desc' ? 'Price High-Low' :
                  sortBy === 'rating-desc' ? 'Rating High-Low' : 'Exp High-Low'
                }
                <button
                  type="button"
                  onClick={() => onSortChange('recommended')}
                  aria-label="Reset sort"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              className="text-clear-all"
              onClick={onClearAllFilters}
            >
              Reset All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
