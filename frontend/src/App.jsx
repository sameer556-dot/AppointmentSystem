import { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import WhyChooseUs from './components/WhyChooseUs'
import CTA from './components/CTA'
import Footer from './components/Footer'
import LocationDateSelection from './components/LocationDateSelection'
import ProviderDiscovery from './components/ProviderDiscovery'
import ProviderDetails from './components/ProviderDetails'
import CustomerDetails from './components/CustomerDetails'
import BookingConfirmation from './components/BookingConfirmation'
import ManageBooking from './components/ManageBooking'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedState, setSelectedState] = useState('Uttarakhand')
  const [selectedCity, setSelectedCity] = useState('Dehradun')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', email: '' })
  const [bookingConfirmation, setBookingConfirmation] = useState(null)
  const [currentView, setCurrentView] = useState('home')
  // Views: 'home' | 'location-date' | 'provider-discovery' | 'provider-details' | 'customer-details' | 'booking-confirmed'

  const scrollToElement = (targetId) => {
    const element = document.getElementById(targetId)
    if (element) {
      const navbarOffset = 76
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - navbarOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNavigate = useCallback((targetId) => {
    if (targetId === 'manage-booking') {
      setCurrentView('manage-booking')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (currentView !== 'home') {
      setCurrentView('home')
      setTimeout(() => {
        scrollToElement(targetId)
      }, 50)
    } else {
      scrollToElement(targetId)
    }
  }, [currentView])

  // Step 1 -> Step 2: Category Selected
  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    setSelectedProvider(null)
    setSelectedSlot(null)
    setBookingConfirmation(null)
    setCurrentView('location-date')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 2 -> Step 3: Location and Date Confirmed -> Go to Provider Discovery
  const handleLocationDateContinue = ({ location, date, state = '', city = '', locality = '' }) => {
    setSelectedLocation(location)
    setSelectedState(state)
    setSelectedCity(city)
    setSelectedLocality(locality)
    if (selectedDate !== date) {
      setSelectedSlot(null)
    }
    setSelectedDate(date)
    setCurrentView('provider-discovery')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 3 -> Step 4: Provider Selected -> Go to Provider Details & Slot Selection
  const handleSelectProvider = (provider) => {
    if (selectedProvider?.id !== provider?.id) {
      setSelectedSlot(null)
    }
    setSelectedProvider(provider)
    setCurrentView('provider-details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 4: Time Slot Selected
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot)
  }

  // Step 4 -> Step 5: Proceed to Customer Details
  const handleProceedToCustomerDetails = () => {
    setCurrentView('customer-details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 5 -> Step 4: Back to Slot Selection
  const handleBackToSlots = () => {
    setCurrentView('provider-details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 5 -> Step 6: Booking Confirmed Success
  const handleBookingSuccess = (booking) => {
    setBookingConfirmation(booking)
    setCurrentView('booking-confirmed')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Reset entire booking workflow
  const handleResetBooking = () => {
    setSelectedCategory(null)
    setSelectedLocation('')
    setSelectedState('Uttarakhand')
    setSelectedCity('Dehradun')
    setSelectedLocality('')
    setSelectedDate('')
    setSelectedProvider(null)
    setSelectedSlot(null)
    setCustomerDetails({ name: '', phone: '', email: '' })
    setBookingConfirmation(null)
    setCurrentView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 4 -> Step 3: Back to Provider Discovery
  const handleBackToProviders = () => {
    setCurrentView('provider-discovery')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step 3 -> Step 2: Back to Location and Date
  const handleBackToLocationDate = () => {
    setCurrentView('location-date')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Back to Category Selection on Homepage
  const handleBackToCategories = () => {
    setCurrentView('home')
    setTimeout(() => {
      scrollToElement('services')
    }, 50)
  }

  return (
    <div className="app-root">
      {/* Navigation Header */}
      <Navbar onNavigate={handleNavigate} currentView={currentView} />

      {/* Main Content Area */}
      <main>
        {currentView === 'manage-booking' && (
          <ManageBooking
            initialPhone={customerDetails.phone || bookingConfirmation?.customer_phone || ''}
            onNavigateHome={handleResetBooking}
            onBookNew={() => {
              setCurrentView('home')
              setTimeout(() => scrollToElement('services'), 50)
            }}
          />
        )}

        {currentView === 'location-date' && (
          <LocationDateSelection
            selectedCategory={selectedCategory}
            initialLocation={selectedLocation}
            initialState={selectedState}
            initialCity={selectedCity}
            initialLocality={selectedLocality}
            initialDate={selectedDate}
            onContinue={handleLocationDateContinue}
            onBackToCategories={handleBackToCategories}
          />
        )}

        {currentView === 'provider-discovery' && (
          <ProviderDiscovery
            selectedCategory={selectedCategory}
            selectedLocation={selectedLocation}
            selectedState={selectedState}
            selectedCity={selectedCity}
            selectedLocality={selectedLocality}
            selectedDate={selectedDate}
            onSelectProvider={handleSelectProvider}
            onBackToLocationDate={handleBackToLocationDate}
          />
        )}

        {(currentView === 'provider-details' || currentView === 'provider-selected') && (
          <ProviderDetails
            selectedCategory={selectedCategory}
            selectedLocation={selectedLocation}
            selectedDate={selectedDate}
            selectedProvider={selectedProvider}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            onProceedToCustomerDetails={handleProceedToCustomerDetails}
            onBackToProviders={handleBackToProviders}
            onBackToCategories={handleBackToCategories}
          />
        )}

        {currentView === 'customer-details' && (
          <CustomerDetails
            selectedCategory={selectedCategory}
            selectedLocation={selectedLocation}
            selectedDate={selectedDate}
            selectedProvider={selectedProvider}
            selectedSlot={selectedSlot}
            customerDetails={customerDetails}
            onCustomerDetailsChange={setCustomerDetails}
            onBookingSuccess={handleBookingSuccess}
            onBackToSlots={handleBackToSlots}
          />
        )}

        {currentView === 'booking-confirmed' && (
          <BookingConfirmation
            initialBookingData={bookingConfirmation}
            bookingId={bookingConfirmation?.booking_id}
            selectedCategory={selectedCategory}
            onBackToHome={handleResetBooking}
            onManageBookings={() => {
              setCurrentView('manage-booking')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {currentView === 'home' && (
          <>
            <Hero onNavigate={handleNavigate} />
            <Services
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
            <HowItWorks />
            <WhyChooseUs />
            <CTA onNavigate={handleNavigate} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  )
}

export default App
