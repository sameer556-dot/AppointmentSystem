"""
Comprehensive Verification Script for City-Based Provider Filtering and India-Wide Provider Expansion.
Tests:
1. Health & DB connection
2. Categories count & integrity
3. Total providers count (199), distribution across 36 cities and 6 categories
4. Seeding idempotency (calling create_app multiple times does not duplicate)
5. City-based filtering accuracy for all requested cities:
   - Jaipur, Mumbai, Delhi, Dehradun, Bengaluru, Pune, Kolkata, Chennai, Hyderabad, etc.
   - Strict city containment (no cross-city leaks)
6. Locality-based filtering inside matched cities
7. Multi-token / location parameter resolution (e.g. "C-Scheme, Jaipur")
8. Negative tests: invalid city, non-existent city, cross-city locality mismatch
9. Slot generation for providers in multiple cities
10. Appointment booking creation and storage in database
"""
import sys
import os

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.models import db, Provider, Category, ProviderAvailability, Appointment
from datetime import datetime, date, timedelta

app = create_app()

def run_tests():
    with app.app_context():
        client = app.test_client()

        print("=== TEST 1: Health Check ===")
        health_resp = client.get('/api/health')
        assert health_resp.status_code == 200, f"Health check failed: {health_resp.status_code}"
        health_data = health_resp.get_json()
        assert health_data['status'] == 'success', "Health status is not success"
        print(f"Health check PASSED: {health_data}")

        print("\n=== TEST 2: Categories Check ===")
        cat_resp = client.get('/api/categories')
        assert cat_resp.status_code == 200
        cat_data = cat_resp.get_json()
        assert len(cat_data['categories']) == 6, f"Expected 6 categories, got {len(cat_data['categories'])}"
        print(f"Categories check PASSED: {len(cat_data['categories'])} categories found.")

        print("\n=== TEST 3: Total Providers & Seeding Idempotency ===")
        total_providers = Provider.query.count()
        print(f"Total Providers in DB: {total_providers}")
        assert total_providers == 199, f"Expected 199 providers, got {total_providers}"

        total_availabilities = ProviderAvailability.query.count()
        print(f"Total Availabilities in DB: {total_availabilities}")
        assert total_availabilities == 199 * 6, f"Expected {199*6} availabilities, got {total_availabilities}"

        # Test idempotency: re-running create_app()
        app2 = create_app()
        with app2.app_context():
            total_after = Provider.query.count()
            assert total_after == 199, f"Seeding is not idempotent: expected 199, got {total_after}"
        print("Seeding idempotency PASSED: Provider count unchanged at 199.")

        print("\n=== TEST 4: Distribution Across Cities and Categories ===")
        from collections import Counter
        all_providers = Provider.query.all()
        city_counts = Counter(p.city for p in all_providers)
        cat_counts = Counter(p.category.name for p in all_providers)

        print(f"Total Cities: {len(city_counts)}")
        print("City Counts:")
        for city, cnt in sorted(city_counts.items(), key=lambda x: -x[1]):
            print(f"  - {city}: {cnt}")
        
        print("\nCategory Counts:")
        for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
            print(f"  - {cat}: {cnt}")

        assert len(city_counts) >= 36, f"Expected at least 36 cities, got {len(city_counts)}"
        assert len(cat_counts) == 6, f"Expected 6 categories, got {len(cat_counts)}"

        print("\n=== TEST 5: City-Based Provider Filtering Accuracy ===")
        cities_to_verify = [
            'Jaipur', 'Mumbai', 'Delhi', 'Dehradun', 'Bengaluru',
            'Pune', 'Kolkata', 'Chennai', 'Hyderabad', 'Ahmedabad',
            'Chandigarh', 'Lucknow', 'Indore', 'Kochi', 'Patna'
        ]

        for city in cities_to_verify:
            resp = client.get(f'/api/providers?category_id=1&city={city}')
            assert resp.status_code == 200, f"Failed for {city}: {resp.status_code}"
            data = resp.get_json()
            providers = data.get('providers', [])
            assert len(providers) > 0, f"Expected providers in {city}, got 0"
            for p in providers:
                # Delhi/New Delhi equivalence is permitted, otherwise exact match
                if city == 'Delhi':
                    assert p['city'] in ['Delhi', 'New Delhi'], f"Provider {p['name']} has city {p['city']}, expected Delhi"
                else:
                    assert p['city'].lower() == city.lower(), f"Provider {p['name']} has city {p['city']}, expected {city}"
            print(f"City '{city}' PASSED: {len(providers)} providers returned, 100% strictly in {city}.")

        print("\n=== TEST 6: Strict Anti-Leak Testing ===")
        # Search Jaipur with a Dehradun locality (e.g., 'Rajpur Road')
        leak_resp = client.get('/api/providers?category_id=1&city=Jaipur&location=Rajpur%20Road')
        assert leak_resp.status_code == 200
        leak_data = leak_resp.get_json()
        assert leak_data['count'] == 0, f"Leak detected! Found {leak_data['count']} providers for Rajpur Road in Jaipur!"
        print("Anti-leak Test 1 PASSED: 'Rajpur Road, Jaipur' returned 0 providers (no Dehradun leak).")

        # Search Dehradun with a Jaipur locality (e.g., 'C-Scheme')
        leak_resp2 = client.get('/api/providers?category_id=1&city=Dehradun&location=C-Scheme')
        assert leak_resp2.status_code == 200
        leak_data2 = leak_resp2.get_json()
        assert leak_data2['count'] == 0, f"Leak detected! Found {leak_data2['count']} providers for C-Scheme in Dehradun!"
        print("Anti-leak Test 2 PASSED: 'C-Scheme, Dehradun' returned 0 providers (no Jaipur leak).")

        # Search composite location string: 'C-Scheme, Jaipur, Rajasthan'
        comp_resp = client.get('/api/providers?category_id=1&location=C-Scheme,%20Jaipur,%20Rajasthan')
        assert comp_resp.status_code == 200
        comp_data = comp_resp.get_json()
        assert comp_data['count'] > 0, "Expected providers for 'C-Scheme, Jaipur, Rajasthan'"
        for p in comp_data['providers']:
            assert p['city'] == 'Jaipur', f"Composite location returned provider from {p['city']}, not Jaipur!"
        print(f"Composite Location 'C-Scheme, Jaipur, Rajasthan' PASSED: {comp_data['count']} providers returned, all in Jaipur.")

        # Non-existent city test
        fake_resp = client.get('/api/providers?category_id=1&city=NonExistentCity123')
        assert fake_resp.status_code == 200
        assert fake_resp.get_json()['count'] == 0
        print("Non-existent City PASSED: returned 0 providers.")

        print("\n=== TEST 7: Slot Generation for Different Cities ===")
        # Get next Monday for testing
        today = date.today()
        days_ahead = (0 - today.weekday() + 7) % 7
        if days_ahead == 0:
            days_ahead = 7
        test_date = (today + timedelta(days=days_ahead)).isoformat()
        print(f"Testing slot generation for date: {test_date} (Monday)")

        # Test Jaipur provider
        jaipur_provider = Provider.query.filter_by(city='Jaipur').first()
        assert jaipur_provider is not None
        slot_resp = client.get(f'/api/providers/{jaipur_provider.id}/slots?date={test_date}')
        assert slot_resp.status_code == 200
        slot_data = slot_resp.get_json()
        assert slot_data['status'] == 'success'
        assert len(slot_data['slots']) > 0
        print(f"Jaipur Provider ({jaipur_provider.name}, ID: {jaipur_provider.id}) Slots PASSED: {len(slot_data['slots'])} slots generated.")

        # Test Mumbai provider
        mumbai_provider = Provider.query.filter_by(city='Mumbai').first()
        assert mumbai_provider is not None
        slot_resp_mumbai = client.get(f'/api/providers/{mumbai_provider.id}/slots?date={test_date}')
        assert slot_resp_mumbai.status_code == 200
        slot_data_mumbai = slot_resp_mumbai.get_json()
        assert slot_data_mumbai['status'] == 'success'
        assert len(slot_data_mumbai['slots']) > 0
        print(f"Mumbai Provider ({mumbai_provider.name}, ID: {mumbai_provider.id}) Slots PASSED: {len(slot_data_mumbai['slots'])} slots generated.")

        print("\n=== TEST 8: End-to-End Booking Creation for New Provider ===")
        target_slot = slot_data['slots'][0]
        booking_payload = {
            'provider_id': jaipur_provider.id,
            'customer_name': 'Aarav Sharma',
            'customer_email': 'aarav.sharma@example.in',
            'customer_phone': '9876543210',
            'appointment_date': test_date,
            'start_time': target_slot['start_time'],
            'end_time': target_slot['end_time'],
            'notes': 'Routine health consultation in Jaipur'
        }
        booking_resp = client.post('/api/bookings', json=booking_payload)
        assert booking_resp.status_code == 201, f"Booking creation failed: {booking_resp.data}"
        booking_result = booking_resp.get_json()
        assert booking_result['status'] == 'success'
        booking_id = booking_result['booking']['id']
        booking_code = booking_result['booking']['booking_id']
        print(f"Booking Creation PASSED: ID={booking_id}, Code={booking_code}, Provider={jaipur_provider.name} ({jaipur_provider.city})")

        # Double-booking prevention check
        conflict_resp = client.post('/api/bookings', json=booking_payload)
        assert conflict_resp.status_code == 409, f"Expected 409 conflict, got {conflict_resp.status_code}"
        print("Double-booking Conflict Check PASSED: correctly rejected with 409.")

        print("\n==========================================")
        print("ALL VERIFICATION SUITE TESTS PASSED (100%)!")
        print("==========================================")

if __name__ == '__main__':
    run_tests()
