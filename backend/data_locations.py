"""
Indian States, Union Territories, and Major Cities reference set for location parsing.
Used to identify city, state, and locality from query strings.
"""

ALL_INDIAN_STATES_LOWER = {
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
    'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
    'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
    'andaman and nicobar islands', 'chandigarh',
    'dadra and nagar haveli and daman and diu', 'delhi', 'jammu and kashmir',
    'ladakh', 'lakshadweep', 'puducherry'
}

ALL_MAJOR_CITIES_LOWER = {
    'delhi', 'new delhi', 'mumbai', 'pune', 'nagpur', 'jaipur', 'jodhpur', 'udaipur',
    'dehradun', 'haridwar', 'rishikesh', 'chandigarh', 'lucknow', 'kanpur', 'varanasi',
    'noida', 'gurugram', 'bengaluru', 'mysuru', 'hyderabad', 'chennai', 'coimbatore',
    'kochi', 'thiruvananthapuram', 'kolkata', 'ahmedabad', 'surat', 'vadodara',
    'bhopal', 'indore', 'patna', 'ranchi', 'bhubaneswar', 'guwahati', 'amritsar',
    'ludhiana', 'srinagar'
}

def resolve_location_parameters(city_param, state_param, location_param):
    """
    Given raw request parameters, returns (target_city, target_state, target_locality).
    Ensures that city is prioritized as the primary filter criterion, and handles
    multi-part strings like 'Malviya Nagar, Jaipur, Rajasthan' or 'Jaipur, Rajasthan'.
    """
    clean_city = city_param.strip() if city_param else ''
    clean_state = state_param.strip() if state_param else ''
    clean_location = location_param.strip() if location_param else ''

    target_city = clean_city or None
    target_state = clean_state or None
    target_locality = None

    if clean_location:
        # Check if clean_location is a comma-separated string
        parts = [p.strip() for p in clean_location.split(',') if p.strip()]

        if len(parts) >= 3:
            # Format: Locality, City, State
            if not target_locality:
                target_locality = parts[0]
            if not target_city:
                target_city = parts[1]
            if not target_state:
                target_state = parts[2]
        elif len(parts) == 2:
            # Could be "City, State" OR "Locality, City"
            if parts[1].lower() in ALL_INDIAN_STATES_LOWER:
                if not target_city:
                    target_city = parts[0]
                if not target_state:
                    target_state = parts[1]
            else:
                if not target_locality:
                    target_locality = parts[0]
                if not target_city:
                    target_city = parts[1]
        elif len(parts) == 1:
            # Single term: check if it's a known city
            candidate = parts[0]
            if not target_city:
                if candidate.lower() in ALL_MAJOR_CITIES_LOWER:
                    target_city = candidate
                else:
                    target_locality = candidate
            else:
                if candidate.lower() != target_city.lower():
                    target_locality = candidate

    return target_city, target_state, target_locality
