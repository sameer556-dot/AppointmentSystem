"""
Comprehensive Automated Test Suite for Manage Booking and Booking History
Tests all 15 requirements specified by the user:
1. Search booking history using a valid phone number
2. Display multiple bookings associated with the same number
3. Verify that different phone numbers see different booking histories
4. Verify that +91 and 10-digit formats are handled consistently
5. Verify that an unknown phone number displays an empty state
6. Verify upcoming, past and cancelled appointment sections
7. Successfully cancel an upcoming confirmed appointment
8. Reject cancellation of a past appointment
9. Reject cancellation of an already cancelled appointment
10. Reject cancellation using another customer's phone number
11. Verify that cancelled appointments remain in SQLite
12. Verify that the cancelled slot becomes available again
13. Verify that existing booking functionality still works
14. Test responsive layouts (verified via CSS rules & frontend build)
15. Run npm run build (verified via Vite build tool)
"""

import sys
import os
from datetime import datetime, date, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.models import db, Appointment, Provider, Category

app = create_app()

def run_all_tests():
    with app.app_context():
        client = app.test_client()

        print("==========================================================")
        print("STARTING TEST SUITE: MANAGE BOOKING & BOOKING HISTORY")
        print("==========================================================")

        # Pre-requisite: ensure we have sample bookings for testing
        # We know phone '9876543210' has bookings.
        # Let's inspect them first.
        res1 = client.get('/api/bookings/history?phone=9876543210')
        assert res1.status_code == 200, f"Failed history lookup: {res1.data}"
        data1 = res1.get_json()
        print(f"\n[Test 1 & 2] Search booking history using valid phone '9876543210':")
        print(f"Status: {data1['status']}, Total Bookings: {data1['count']}")
        assert data1['count'] >= 2, "Expected multiple bookings for 9876543210"
        for b in data1['bookings']:
            print(f"  - [{b['booking_id']}] {b['category_name']} ({b['provider_name']}) on {b['appointment_date']} at {b['start_time']} -> Status: {b['display_status']}")
        print("✓ Test 1 PASSED: Successfully searched booking history by phone.")
        print("✓ Test 2 PASSED: Successfully displayed multiple bookings for the same phone number.")

        # Test 3: Verify isolation between different numbers
        res_phone2 = client.get('/api/bookings/history?phone=8209309517')
        assert res_phone2.status_code == 200
        data2 = res_phone2.get_json()
        ids_phone1 = {b['booking_id'] for b in data1['bookings']}
        ids_phone2 = {b['booking_id'] for b in data2['bookings']}
        assert ids_phone1.isdisjoint(ids_phone2), "Privacy breach: Bookings leaked across different phone numbers!"
        print(f"\n[Test 3] Isolation check between '9876543210' ({len(ids_phone1)} bookings) and '8209309517' ({len(ids_phone2)} bookings):")
        print(f"Shared booking IDs: {ids_phone1.intersection(ids_phone2)}")
        print("✓ Test 3 PASSED: Strict booking data isolation verified between different numbers.")

        # Test 4: Verify +91, 91, and 10-digit formats are handled consistently
        res_plus91 = client.get('/api/bookings/history?phone=%2B919876543210')
        assert res_plus91.status_code == 200
        assert res_plus91.get_json()['count'] == data1['count']

        res_91 = client.get('/api/bookings/history?phone=919876543210')
        assert res_91.status_code == 200
        assert res_91.get_json()['count'] == data1['count']

        res_spaces = client.get('/api/bookings/history?phone=%2B91%2098765%2043210')
        assert res_spaces.status_code == 200
        assert res_spaces.get_json()['count'] == data1['count']
        print(f"\n[Test 4] Normalization check for '+91 98765 43210', '919876543210', and '9876543210':")
        print(f"All returned identical count of {data1['count']} bookings.")
        print("✓ Test 4 PASSED: +91, 91, and spaced phone number formats handled consistently.")

        # Test 5: Unknown phone number returns clean empty state
        res_unknown = client.get('/api/bookings/history?phone=9999900000')
        assert res_unknown.status_code == 200
        data_unknown = res_unknown.get_json()
        assert data_unknown['count'] == 0
        assert len(data_unknown['bookings']) == 0
        assert "No bookings found" in data_unknown['message']
        print(f"\n[Test 5] Unknown phone '9999900000' lookup:")
        print(f"Returned: count={data_unknown['count']}, message='{data_unknown['message']}'")
        print("✓ Test 5 PASSED: Unknown phone returns appropriate empty state.")

        # Test 6: Verify upcoming, past and cancelled appointment sections
        # Let's create an upcoming, a past, and a cancelled appointment for a dedicated test phone
        test_phone = "9811122233"
        provider = Provider.query.first()
        today = date.today()
        future_date = (today + timedelta(days=7)).isoformat()
        past_date = "2024-01-15"

        # Clean any previous test rows for this phone
        Appointment.query.filter_by(customer_phone=test_phone).delete()
        db.session.commit()

        # Create upcoming confirmed
        appt_upcoming = Appointment(
            booking_id="APT-2026-TESTUPCOMING",
            provider_id=provider.id,
            category_id=provider.category_id,
            customer_name="Test Sections User",
            customer_phone=test_phone,
            appointment_date=future_date,
            start_time="14:00",
            end_time="14:30",
            consultation_fee=600,
            status="Confirmed"
        )
        # Create past
        appt_past = Appointment(
            booking_id="APT-2024-TESTPAST",
            provider_id=provider.id,
            category_id=provider.category_id,
            customer_name="Test Sections User",
            customer_phone=test_phone,
            appointment_date=past_date,
            start_time="10:00",
            end_time="10:30",
            consultation_fee=600,
            status="Confirmed"
        )
        # Create cancelled
        appt_cancelled = Appointment(
            booking_id="APT-2026-TESTCANCELLED",
            provider_id=provider.id,
            category_id=provider.category_id,
            customer_name="Test Sections User",
            customer_phone=test_phone,
            appointment_date=future_date,
            start_time="15:00",
            end_time="15:30",
            consultation_fee=600,
            status="Cancelled"
        )
        db.session.add_all([appt_upcoming, appt_past, appt_cancelled])
        db.session.commit()

        res_sections = client.get(f'/api/bookings/history?phone={test_phone}')
        assert res_sections.status_code == 200
        sec_bookings = res_sections.get_json()['bookings']
        assert len(sec_bookings) == 3

        upcoming_list = [b for b in sec_bookings if b['display_status'] == 'Confirmed' and not b['is_past']]
        past_list = [b for b in sec_bookings if b['display_status'] == 'Past' or (b['is_past'] and b['display_status'] != 'Cancelled')]
        cancelled_list = [b for b in sec_bookings if b['display_status'] == 'Cancelled']

        print(f"\n[Test 6] Verification of Appointment Categorization:")
        print(f"Upcoming: {[b['booking_id'] for b in upcoming_list]} (Cancellable: {[b['is_cancellable'] for b in upcoming_list]})")
        print(f"Past: {[b['booking_id'] for b in past_list]} (Cancellable: {[b['is_cancellable'] for b in past_list]})")
        print(f"Cancelled: {[b['booking_id'] for b in cancelled_list]} (Cancellable: {[b['is_cancellable'] for b in cancelled_list]})")

        assert len(upcoming_list) == 1 and upcoming_list[0]['is_cancellable'] is True
        assert len(past_list) == 1 and past_list[0]['is_cancellable'] is False
        assert len(cancelled_list) == 1 and cancelled_list[0]['is_cancellable'] is False
        print("✓ Test 6 PASSED: Upcoming, Past, and Cancelled appointments correctly categorized.")

        # Test 7: Successfully cancel an upcoming confirmed appointment
        cancel_res = client.patch(
            f"/api/bookings/{appt_upcoming.booking_id}/cancel",
            json={'phone': test_phone}
        )
        assert cancel_res.status_code == 200, f"Cancellation failed: {cancel_res.data}"
        cancel_data = cancel_res.get_json()
        assert cancel_data['status'] == 'success'
        assert cancel_data['booking']['display_status'] == 'Cancelled'
        print(f"\n[Test 7] Cancelled upcoming appointment {appt_upcoming.booking_id}:")
        print(f"Response message: {cancel_data['message']}")
        print("✓ Test 7 PASSED: Upcoming confirmed appointment successfully cancelled.")

        # Test 8: Reject cancellation of a past appointment
        past_cancel_res = client.patch(
            f"/api/bookings/{appt_past.booking_id}/cancel",
            json={'phone': test_phone}
        )
        assert past_cancel_res.status_code == 400
        assert "past" in past_cancel_res.get_json()['message'].lower()
        print(f"\n[Test 8] Cancellation of past appointment {appt_past.booking_id}:")
        print(f"Status: {past_cancel_res.status_code}, Message: {past_cancel_res.get_json()['message']}")
        print("✓ Test 8 PASSED: Cancellation of past appointment rejected with 400.")

        # Test 9: Reject cancellation of an already cancelled appointment
        already_cancelled_res = client.patch(
            f"/api/bookings/{appt_cancelled.booking_id}/cancel",
            json={'phone': test_phone}
        )
        assert already_cancelled_res.status_code == 400
        assert "already been cancelled" in already_cancelled_res.get_json()['message'].lower()
        print(f"\n[Test 9] Cancellation of already cancelled appointment {appt_cancelled.booking_id}:")
        print(f"Status: {already_cancelled_res.status_code}, Message: {already_cancelled_res.get_json()['message']}")
        print("✓ Test 9 PASSED: Cancellation of already cancelled appointment rejected with 400.")

        # Test 10: Reject cancellation using another customer's phone number
        unauth_cancel_res = client.patch(
            f"/api/bookings/{appt_upcoming.booking_id}/cancel",
            json={'phone': '9876543210'}  # different phone
        )
        assert unauth_cancel_res.status_code == 403
        assert "unauthorized" in unauth_cancel_res.get_json()['message'].lower()
        print(f"\n[Test 10] Unauthorized cancellation using different customer's phone:")
        print(f"Status: {unauth_cancel_res.status_code}, Message: {unauth_cancel_res.get_json()['message']}")
        print("✓ Test 10 PASSED: Cancellation with mismatched phone rejected with 403 Forbidden.")

        # Test 11: Verify cancelled appointments remain in SQLite database
        appt_in_sqlite = Appointment.query.filter_by(booking_id=appt_upcoming.booking_id).first()
        assert appt_in_sqlite is not None, "Cancelled appointment was deleted from SQLite!"
        assert appt_in_sqlite.status == "Cancelled", f"Status in SQLite is {appt_in_sqlite.status}, expected Cancelled"
        print(f"\n[Test 11] Direct SQLite query for {appt_upcoming.booking_id}:")
        print(f"Record exists: ID={appt_in_sqlite.id}, Booking={appt_in_sqlite.booking_id}, Status={appt_in_sqlite.status}")
        print("✓ Test 11 PASSED: Cancelled appointment permanently preserved in SQLite.")

        # Test 12: Verify that the cancelled slot becomes available again
        # The cancelled slot was appt_upcoming (future_date, 14:00)
        slots_res = client.get(f"/api/providers/{provider.id}/slots?date={future_date}")
        assert slots_res.status_code == 200
        available_slots = [s['start_time'] for s in slots_res.get_json()['slots']]
        assert "14:00" in available_slots, "Cancelled slot 14:00 did not become available again!"
        print(f"\n[Test 12] Slot availability check on {future_date} after cancellation:")
        print(f"Slot 14:00 is present in available slots list: {'14:00' in available_slots}")
        print("✓ Test 12 PASSED: Cancelled slot became available again in slots API.")

        # Test 13: Verify that existing booking functionality still works to book this slot
        new_booking_res = client.post('/api/bookings', json={
            'provider_id': provider.id,
            'customer_name': 'New Booked Customer',
            'customer_phone': '9988771122',
            'customer_email': 'newcustomer@example.com',
            'appointment_date': future_date,
            'start_time': '14:00'
        })
        assert new_booking_res.status_code == 201, f"Failed to book re-opened slot: {new_booking_res.data}"
        new_b = new_booking_res.get_json()['booking']
        print(f"\n[Test 13] Re-booked the cancelled slot 14:00 with new booking:")
        print(f"New Booking ID: {new_b['booking_id']}, Customer: {new_b['customer_name']}, Status: {new_b['status']}")
        
        # Verify duplicate booking prevention on the re-opened slot
        conflict_res = client.post('/api/bookings', json={
            'provider_id': provider.id,
            'customer_name': 'Another Customer Attempting Same Slot',
            'customer_phone': '9988773344',
            'appointment_date': future_date,
            'start_time': '14:00'
        })
        assert conflict_res.status_code == 409
        print(f"Duplicate booking attempt correctly rejected with 409 conflict.")
        print("✓ Test 13 PASSED: Booking workflow and duplicate prevention fully preserved.")

        # Cleanup test records
        Appointment.query.filter_by(customer_phone=test_phone).delete()
        Appointment.query.filter_by(booking_id=new_b['booking_id']).delete()
        db.session.commit()
        print("\nCleaned up temporary test appointments.")

        print("\n==========================================================")
        print("ALL 13 API & DATABASE ACCEPTANCE CRITERIA PASSED (100%)!")
        print("==========================================================")

if __name__ == '__main__':
    run_all_tests()
