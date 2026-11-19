/**
 * India Locations Dataset
 * Contains all 28 States, 8 Union Territories, and major cities/towns across India.
 * Includes common localities for key hubs (e.g. Dehradun).
 * Pure local dataset — zero paid APIs, zero external network calls.
 */

export const INDIAN_STATES_AND_UTS = [
  // 28 States
  { name: 'Andhra Pradesh', type: 'State' },
  { name: 'Arunachal Pradesh', type: 'State' },
  { name: 'Assam', type: 'State' },
  { name: 'Bihar', type: 'State' },
  { name: 'Chhattisgarh', type: 'State' },
  { name: 'Goa', type: 'State' },
  { name: 'Gujarat', type: 'State' },
  { name: 'Haryana', type: 'State' },
  { name: 'Himachal Pradesh', type: 'State' },
  { name: 'Jharkhand', type: 'State' },
  { name: 'Karnataka', type: 'State' },
  { name: 'Kerala', type: 'State' },
  { name: 'Madhya Pradesh', type: 'State' },
  { name: 'Maharashtra', type: 'State' },
  { name: 'Manipur', type: 'State' },
  { name: 'Meghalaya', type: 'State' },
  { name: 'Mizoram', type: 'State' },
  { name: 'Nagaland', type: 'State' },
  { name: 'Odisha', type: 'State' },
  { name: 'Punjab', type: 'State' },
  { name: 'Rajasthan', type: 'State' },
  { name: 'Sikkim', type: 'State' },
  { name: 'Tamil Nadu', type: 'State' },
  { name: 'Telangana', type: 'State' },
  { name: 'Tripura', type: 'State' },
  { name: 'Uttar Pradesh', type: 'State' },
  { name: 'Uttarakhand', type: 'State' },
  { name: 'West Bengal', type: 'State' },

  // 8 Union Territories
  { name: 'Andaman and Nicobar Islands', type: 'Union Territory' },
  { name: 'Chandigarh', type: 'Union Territory' },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory' },
  { name: 'Delhi', type: 'Union Territory' },
  { name: 'Jammu and Kashmir', type: 'Union Territory' },
  { name: 'Ladakh', type: 'Union Territory' },
  { name: 'Lakshadweep', type: 'Union Territory' },
  { name: 'Puducherry', type: 'Union Territory' }
]

export const CITIES_BY_STATE = {
  'Uttarakhand': [
    'Dehradun',
    'Haridwar',
    'Roorkee',
    'Rishikesh',
    'Haldwani',
    'Rudrapur',
    'Kashipur',
    'Nainital',
    'Mussoorie',
    'Kotdwar',
    'Almora',
    'Pithoragarh',
    'Ramnagar',
    'Vikas Nagar',
    'Tehri',
    'Pauri',
    'Chamoli',
    'Uttarkashi',
    'Champawat',
    'Bageshwar',
    'Rudraprayag',
    'Kichha',
    'Manglaur',
    'Sitarganj',
    'Jaspur',
    'Laksar'
  ],
  'Maharashtra': [
    'Mumbai',
    'Pune',
    'Nagpur',
    'Thane',
    'Nashik',
    'Aurangabad',
    'Solapur',
    'Amravati',
    'Kolhapur',
    'Navi Mumbai',
    'Jalgaon',
    'Akola',
    'Nanded',
    'Dhule',
    'Ahmednagar',
    'Chandrapur',
    'Parbhani',
    'Latur',
    'Panvel',
    'Satara',
    'Ratnagiri',
    'Wardha',
    'Gondia',
    'Baramati'
  ],
  'Delhi': [
    'Delhi',
    'New Delhi',
    'Central Delhi',
    'North Delhi',
    'South Delhi',
    'East Delhi',
    'West Delhi',
    'Dwarka',
    'Rohini',
    'Saket',
    'Connaught Place',
    'Karol Bagh',
    'Vasant Kunj',
    'Lajpat Nagar',
    'Janakpuri',
    'Shahdara'
  ],
  'Karnataka': [
    'Bengaluru',
    'Mysuru',
    'Hubballi-Dharwad',
    'Mangaluru',
    'Belagavi',
    'Davanagere',
    'Ballari',
    'Vijayapura',
    'Shivamogga',
    'Tumakuru',
    'Kalaburagi',
    'Udupi',
    'Bidar',
    'Hosapete',
    'Hassan',
    'Gadag',
    'Raichur'
  ],
  'Tamil Nadu': [
    'Chennai',
    'Coimbatore',
    'Madurai',
    'Tiruchirappalli',
    'Salem',
    'Tirunelveli',
    'Tiruppur',
    'Vellore',
    'Erode',
    'Thoothukudi',
    'Dindigul',
    'Thanjavur',
    'Nagercoil',
    'Kanchipuram',
    'Karur',
    'Hosur',
    'Cuddalore'
  ],
  'Uttar Pradesh': [
    'Lucknow',
    'Kanpur',
    'Varanasi',
    'Agra',
    'Noida',
    'Greater Noida',
    'Ghaziabad',
    'Prayagraj',
    'Meerut',
    'Bareilly',
    'Aligarh',
    'Moradabad',
    'Saharanpur',
    'Gorakhpur',
    'Jhansi',
    'Mathura',
    'Ayodhya',
    'Firozabad',
    'Muzaffarnagar',
    'Budaun',
    'Rampur',
    'Shahjahanpur'
  ],
  'Gujarat': [
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Bhavnagar',
    'Jamnagar',
    'Junagadh',
    'Gandhinagar',
    'Anand',
    'Navsari',
    'Morbi',
    'Bharuch',
    'Porbandar',
    'Mehsana',
    'Bhuj',
    'Valsad',
    'Vapi'
  ],
  'Rajasthan': [
    'Jaipur',
    'Jodhpur',
    'Kota',
    'Bikaner',
    'Ajmer',
    'Udaipur',
    'Bhilwara',
    'Alwar',
    'Sikar',
    'Sri Ganganagar',
    'Pali',
    'Bharatpur',
    'Barmer',
    'Chittorgarh',
    'Tonk',
    'Beawar',
    'Hanumangarh'
  ],
  'West Bengal': [
    'Kolkata',
    'Howrah',
    'Durgapur',
    'Asansol',
    'Siliguri',
    'Bardhaman',
    'Malda',
    'Kharagpur',
    'Haldia',
    'Darjeeling',
    'Berhampore',
    'Habra',
    'Kalyani',
    'Jalpaiguri',
    'Raiganj'
  ],
  'Telangana': [
    'Hyderabad',
    'Warangal',
    'Nizamabad',
    'Karimnagar',
    'Ramagundam',
    'Khammam',
    'Mahbubnagar',
    'Nalgonda',
    'Adilabad',
    'Secunderabad',
    'Suryapet',
    'Siddipet',
    'Miryalaguda'
  ],
  'Kerala': [
    'Thiruvananthapuram',
    'Kochi',
    'Kozhikode',
    'Thrissur',
    'Kollam',
    'Palakkad',
    'Alappuzha',
    'Kannur',
    'Kottayam',
    'Malappuram',
    'Manjeri',
    'Thalassery',
    'Ponnani'
  ],
  'Madhya Pradesh': [
    'Bhopal',
    'Indore',
    'Jabalpur',
    'Gwalior',
    'Ujjain',
    'Sagar',
    'Dewas',
    'Satna',
    'Ratlam',
    'Rewa',
    'Murwara (Katni)',
    'Singrauli',
    'Burhanpur',
    'Khandwa',
    'Bhind',
    'Chhindwara',
    'Guna'
  ],
  'Punjab': [
    'Ludhiana',
    'Amritsar',
    'Jalandhar',
    'Patiala',
    'Bathinda',
    'Mohali',
    'Hoshiarpur',
    'Pathankot',
    'Moga',
    'Batala',
    'Abohar',
    'Malerkotla',
    'Khanna',
    'Phagwara',
    'Muktsar'
  ],
  'Haryana': [
    'Gurugram',
    'Faridabad',
    'Panipat',
    'Ambala',
    'Yamunanagar',
    'Rohtak',
    'Hisar',
    'Karnal',
    'Sonipat',
    'Panchkula',
    'Sirsa',
    'Bhiwani',
    'Bahadurgarh',
    'Jind',
    'Thanesar',
    'Kaithal',
    'Rewari'
  ],
  'Bihar': [
    'Patna',
    'Gaya',
    'Bhagalpur',
    'Muzaffarpur',
    'Purnia',
    'Darbhanga',
    'Bihar Sharif',
    'Arrah',
    'Begusarai',
    'Katihar',
    'Munger',
    'Chhapra',
    'Danapur',
    'Bettiah',
    'Saharsa',
    'Sasaram',
    'Hajipur',
    'Dehri'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam',
    'Vijayawada',
    'Guntur',
    'Nellore',
    'Kurnool',
    'Kakinada',
    'Rajamahendravaram',
    'Tirupati',
    'Kadapa',
    'Anantapur',
    'Vizianagaram',
    'Eluru',
    'Ongole',
    'Nandyal',
    'Machilipatnam',
    'Adoni',
    'Tenali'
  ],
  'Odisha': [
    'Bhubaneswar',
    'Cuttack',
    'Rourkela',
    'Berhampur',
    'Sambalpur',
    'Puri',
    'Balasore',
    'Bhadrak',
    'Baripada',
    'Jharsuguda',
    'Jeypore',
    'Bargarh',
    'Rayagada',
    'Bolangir'
  ],
  'Assam': [
    'Guwahati',
    'Silchar',
    'Dibrugarh',
    'Jorhat',
    'Nagaon',
    'Tinsukia',
    'Tezpur',
    'Bongaigaon',
    'Karimganj',
    'Sivasagar',
    'Goalpara',
    'Barpeta',
    'Dhubri',
    'North Lakhimpur'
  ],
  'Jharkhand': [
    'Ranchi',
    'Jamshedpur',
    'Dhanbad',
    'Bokaro Steel City',
    'Deoghar',
    'Hazaribagh',
    'Giridih',
    'Ramgarh',
    'Medininagar',
    'Chirkunda',
    'Phusro',
    'Chaibasa'
  ],
  'Chhattisgarh': [
    'Raipur',
    'Bhilai',
    'Bilaspur',
    'Korba',
    'Rajnandgaon',
    'Jagdalpur',
    'Durg',
    'Ambikapur',
    'Raigarh',
    'Dhamtari',
    'Mahasamund',
    'Chirmiri'
  ],
  'Himachal Pradesh': [
    'Shimla',
    'Dharamshala',
    'Solan',
    'Mandi',
    'Kullu',
    'Manali',
    'Baddi',
    'Palampur',
    'Hamirpur',
    'Una',
    'Nahan',
    'Bilaspur',
    'Chamba',
    'Paonta Sahib'
  ],
  'Goa': [
    'Panaji',
    'Margao',
    'Vasco da Gama',
    'Mapusa',
    'Ponda',
    'Bicholim',
    'Curchorem',
    'Cuncolim'
  ],
  'Jammu and Kashmir': [
    'Srinagar',
    'Jammu',
    'Anantnag',
    'Baramulla',
    'Kathua',
    'Udhampur',
    'Sopore',
    'Rajouri',
    'Poonch',
    'Pulwama',
    'Kupwara',
    'Ganderbal'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Ladakh': [
    'Leh',
    'Kargil'
  ],
  'Puducherry': [
    'Puducherry',
    'Karaikal',
    'Mahe',
    'Yanam',
    'Ozhukarai'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair',
    'Diglipur',
    'Mayabunder',
    'Rangat',
    'Garacharma'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman',
    'Diu',
    'Silvassa',
    'Amli'
  ],
  'Lakshadweep': [
    'Kavaratti',
    'Agatti',
    'Amini',
    'Andrott',
    'Minicoy'
  ],
  'Sikkim': [
    'Gangtok',
    'Namchi',
    'Geyzing',
    'Mangan',
    'Rangpo',
    'Singtam'
  ],
  'Tripura': [
    'Agartala',
    'Dharmanagar',
    'Udaipur',
    'Kailashahar',
    'Belonia',
    'Khowai',
    'Ambassa'
  ],
  'Meghalaya': [
    'Shillong',
    'Tura',
    'Jowai',
    'Nongpoh',
    'Williamnagar',
    'Baghmara'
  ],
  'Manipur': [
    'Imphal',
    'Churachandpur',
    'Thoubal',
    'Kakching',
    'Ukhrul',
    'Bishnupur'
  ],
  'Nagaland': [
    'Kohima',
    'Dimapur',
    'Mokokchung',
    'Tuensang',
    'Wokha',
    'Zunheboto'
  ],
  'Arunachal Pradesh': [
    'Itanagar',
    'Naharlagun',
    'Pasighat',
    'Tawang',
    'Ziro',
    'Bomdila',
    'Roing',
    'Tezu'
  ],
  'Mizoram': [
    'Aizawl',
    'Lunglei',
    'Champhai',
    'Serchhip',
    'Kolasib',
    'Lawngtlai'
  ]
}

export const COMMON_LOCALITIES = {
  'Dehradun': [
    'Rajpur Road',
    'Prem Nagar',
    'Ballupur',
    'Clock Tower',
    'Sahastradhara Road',
    'Clement Town',
    'Jakhan',
    'Patel Nagar',
    'Dalanwala',
    'Hathibarkala',
    'Dharampur',
    'Karanpur',
    'Nehru Colony',
    'Vasant Vihar',
    'GMS Road'
  ],
  'Delhi': [
    'Connaught Place',
    'Saket',
    'Hauz Khas',
    'Dwarka',
    'Rohini',
    'Karol Bagh',
    'Vasant Kunj',
    'Lajpat Nagar',
    'South Extension'
  ],
  'New Delhi': [
    'Connaught Place',
    'Chanakyapuri',
    'Barakhamba',
    'Paharganj',
    'Lajpat Nagar',
    'Saket',
    'Hauz Khas'
  ],
  'Mumbai': [
    'Andheri',
    'Bandra',
    'Borivali',
    'Dadar',
    'Juhu',
    'Colaba',
    'Powai',
    'Worli',
    'Malad',
    'Goregaon'
  ],
  'Bengaluru': [
    'Koramangala',
    'Indiranagar',
    'Whitefield',
    'HSR Layout',
    'Jayanagar',
    'Electronic City',
    'Marathahalli',
    'Malleshwaram'
  ],
  'Jaipur': [
    'C-Scheme',
    'Malviya Nagar',
    'Vaishali Nagar',
    'Mansarovar',
    'Raja Park',
    'Tonk Road',
    'MI Road',
    'Bani Park'
  ],
  'Pune': [
    'Kothrud',
    'Baner',
    'Viman Nagar',
    'Koregaon Park',
    'Aundh',
    'Shivajinagar',
    'Hinjewadi',
    'Wakad'
  ],
  'Hyderabad': [
    'Banjara Hills',
    'Jubilee Hills',
    'Gachibowli',
    'Madhapur',
    'Hitec City',
    'Kondapur',
    'Begumpet',
    'Kukatpally'
  ],
  'Chennai': [
    'T Nagar',
    'Anna Nagar',
    'Adyar',
    'Velachery',
    'Mylapore',
    'Alwarpet',
    'Nungambakkam'
  ],
  'Kolkata': [
    'Salt Lake',
    'Park Street',
    'New Town',
    'Ballygunge',
    'Alipore',
    'Gariahat',
    'Howrah'
  ],
  'Ahmedabad': [
    'Navrangpura',
    'Satellite',
    'Bodakdev',
    'SG Highway',
    'Prahlad Nagar',
    'Maninagar',
    'Vastrapur'
  ],
  'Chandigarh': [
    'Sector 17',
    'Sector 35',
    'Sector 22',
    'Sector 43',
    'Sector 8',
    'Sector 9'
  ],
  'Lucknow': [
    'Hazratganj',
    'Gomti Nagar',
    'Aliganj',
    'Indira Nagar',
    'Mahanagar',
    'Alambagh'
  ]
}

export const DEFAULT_STATE = 'Uttarakhand'
export const DEFAULT_CITY = 'Dehradun'

/**
 * Returns all Indian States & Union Territories
 */
export function getIndianStatesAndUTs() {
  return INDIAN_STATES_AND_UTS
}

/**
 * Returns cities for a given state or UT (case-insensitive search on state)
 */
export function getCitiesForState(stateName) {
  if (!stateName) return []
  const foundState = Object.keys(CITIES_BY_STATE).find(
    (s) => s.toLowerCase() === stateName.trim().toLowerCase()
  )
  return foundState ? CITIES_BY_STATE[foundState] : []
}

/**
 * Filter cities within a state by a search query
 */
export function searchCities(stateName, query) {
  const cities = getCitiesForState(stateName)
  if (!query || !query.trim()) return cities
  const cleanQuery = query.trim().toLowerCase()
  return cities.filter((city) => city.toLowerCase().includes(cleanQuery))
}

/**
 * Returns known localities for a city if available, otherwise empty array
 */
export function getLocalitiesForCity(cityName) {
  if (!cityName) return []
  const foundCity = Object.keys(COMMON_LOCALITIES).find(
    (c) => c.toLowerCase() === cityName.trim().toLowerCase()
  )
  return foundCity ? COMMON_LOCALITIES[foundCity] : []
}
