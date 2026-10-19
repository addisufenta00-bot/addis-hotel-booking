import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Bed, 
  Star, 
  PlusCircle, 
  Trash2, 
  DollarSign, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles,
  ChevronRight,
  LogOut,
  AlertCircle,
  MapPin,
  Crown,
  Hotel,
  LogIn,
  UserPlus
} from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && window.location.port === '3300')
  ? 'http://localhost:5050/api'
  : (import.meta.env.VITE_API_URL || '/api');

export default function App() {
  // Navigation & View State
  const [view, setView] = useState('browse'); // 'browse', 'my-bookings', 'admin', 'hotels'
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hotel_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Multi-Hotel State
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Rooms & Filters State
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [searchQuery, setSearchQuery] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [availabilityFilter, setAvailabilityFilter] = useState('All'); // 'All', 'available', 'booked'
  const [roomCounts, setRoomCounts] = useState({ total: 8, booked: 3, available: 5 });

  // Booking Modal State
  const [bookingRoom, setBookingRoom] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+251 9');
  const [paymentMethod, setPaymentMethod] = useState('telebirr');
  const [kebeleId, setKebeleId] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // My Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [loadingMyBookings, setLoadingMyBookings] = useState(false);

  // Admin Dashboard State
  const [adminStats, setAdminStats] = useState(null);
  const [adminHotelBreakdown, setAdminHotelBreakdown] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminSelectedHotelFilter, setAdminSelectedHotelFilter] = useState('All');
  
  // Modals for Adding Hotel & Room
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);

  const [newHotel, setNewHotel] = useState({
    name: '',
    city: 'Addis Ababa',
    address: '',
    star_rating: 4.8,
    phone: '+251 ',
    email: '',
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: '',
    manager_name: '',
    manager_email: '',
    manager_password: ''
  });

  const [newRoom, setNewRoom] = useState({
    hotel_id: '',
    room_number: '',
    title: '',
    room_type: 'Deluxe',
    price_per_night: '',
    capacity: 2,
    amenities: 'WiFi, AC, TV, Breakfast Included',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    description: ''
  });

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // 1. Fetch Hotels List
  useEffect(() => {
    fetchHotels();
  }, []);

  // Sync logged in user profile with customer booking details
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  const fetchHotels = async () => {
    try {
      const res = await fetch(`${API_BASE}/hotels`);
      const data = await res.json();
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
    }
  };

  // 2. Fetch Rooms with Filters
  useEffect(() => {
    fetchRooms();
  }, [selectedHotel, selectedCity, selectedType, maxPrice, searchQuery, guestCount, availabilityFilter]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      let url = `${API_BASE}/rooms?maxPrice=${maxPrice}&capacity=${guestCount}`;
      if (selectedHotel !== 'All') url += `&hotel_id=${selectedHotel}`;
      if (selectedCity !== 'All') url += `&city=${encodeURIComponent(selectedCity)}`;
      if (selectedType !== 'All') url += `&type=${selectedType}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (availabilityFilter !== 'All') url += `&availability=${availabilityFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
        if (data.totalRooms !== undefined) {
          setRoomCounts({
            total: data.totalRooms,
            booked: data.bookedCount,
            available: data.availableCount
          });
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // 3. Fetch My Bookings
  const fetchMyBookings = async (email) => {
    const targetEmail = email || user?.email || customerEmail;
    if (!targetEmail) return;
    setLoadingMyBookings(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/my?email=${encodeURIComponent(targetEmail)}`);
      const data = await res.json();
      if (data.success) {
        setMyBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching my bookings:', err);
    } finally {
      setLoadingMyBookings(false);
    }
  };

  // 4. Fetch Admin Data (Adapts to Super Admin vs Hotel Admin)
  const fetchAdminData = async (hotelFilterOverride) => {
    setLoadingAdmin(true);
    try {
      let targetHotelId = null;
      if (user?.role === 'hotel_admin') {
        targetHotelId = user.hotel_id;
      } else if (user?.role === 'super_admin') {
        const filter = hotelFilterOverride !== undefined ? hotelFilterOverride : adminSelectedHotelFilter;
        if (filter !== 'All') targetHotelId = filter;
      }

      let statsUrl = `${API_BASE}/admin/stats`;
      let bookingsUrl = `${API_BASE}/bookings/all`;
      if (targetHotelId) {
        statsUrl += `?hotel_id=${targetHotelId}`;
        bookingsUrl += `?hotel_id=${targetHotelId}`;
      }

      const [statsRes, bookingsRes] = await Promise.all([
        fetch(statsUrl),
        fetch(bookingsUrl)
      ]);
      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      if (statsData.success) {
        setAdminStats(statsData.stats);
        if (statsData.hotelBreakdown) setAdminHotelBreakdown(statsData.hotelBreakdown);
      }
      if (bookingsData.success) setAllBookings(bookingsData.bookings);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === 'my-bookings') {
      if (user) fetchMyBookings(user.email);
    } else if (newView === 'admin') {
      fetchAdminData();
    }
  };

  // Handle Login & Role Switch
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload = authMode === 'login' 
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword, phone: authPhone };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('hotel_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('hotel_token', data.token);
        setCustomerName(data.user.name);
        setCustomerEmail(data.user.email);
        setCustomerPhone(data.user.phone || '');
        setShowAuthModal(false);
        if (data.user.role === 'admin' || data.user.role === 'super_admin' || data.user.role === 'hotel_admin') {
          handleViewChange('admin');
        } else {
          setView('browse');
        }
      } else {
        setAuthError(data.message || 'ስህተት ተከስቷል');
      }
    } catch (err) {
      setAuthError('ከአገልጋይ ጋር መገናኘት አልተቻለም');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_token');
    setView('browse');
    setAuthEmail('');
    setAuthPassword('');
    setAuthError('');
  };

  const quickLoginAs = (email, password) => {
    setAuthEmail(email);
    setAuthPassword(password);
  };

  // Calculate Nights and Price for Booking
  const calculateBookingTotal = () => {
    if (!checkIn || !checkOut || !bookingRoom) return { nights: 0, total: 0 };
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = outDate.getTime() - inDate.getTime();
    const nights = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    const total = nights * parseFloat(bookingRoom.price_per_night);
    return { nights, total };
  };

  // Create Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    setIsSubmittingBooking(true);

    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: bookingRoom.id,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestCount,
          payment_method: paymentMethod,
          kebele_id_or_passport: kebeleId || 'ET-AA-ID-' + Math.floor(10000 + Math.random() * 90000)
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookingSuccess(data);
        fetchRooms(); // refresh rooms status
      } else {
        setBookingError(data.message || 'ማስያዝ አልተቻለም');
      }
    } catch (err) {
      setBookingError('ከአገልጋይ ጋር መገናኘት አልተቻለም');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Cancel Booking with Tiered Refund Engine
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('እርግጠኛ ነዎት ይህን ማስያዣ መሰረዝ ይፈልጋሉ? በስረዛ ደንቡ መሰረት የተመላሽ ሂሳብ ይሰላል።')) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchRooms();
        if (view === 'my-bookings') fetchMyBookings();
        if (view === 'admin') fetchAdminData();
      } else {
        alert(data.message || 'መሰረዝ አልተቻለም');
      }
    } catch (err) {
      alert('መሰረዝ አልተቻለም');
    }
  };

  // Super Admin: Add New Hotel
  const handleAddHotel = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHotel)
      });
      const data = await res.json();
      if (data.success) {
        alert('አዲስ ሆቴል እና አስተዳዳሪው በተሳካ ሁኔታ ተመዝግቧል!');
        setShowAddHotelModal(false);
        fetchHotels();
        fetchAdminData();
      }
    } catch (err) {
      alert('ሆቴሉን መመዝገብ አልተቻለም');
    }
  };

  // Add Room (Admin)
  const handleAddRoom = async (e) => {
    e.preventDefault();
    const targetHotelId = user?.role === 'hotel_admin' ? user.hotel_id : newRoom.hotel_id;
    if (!targetHotelId) {
      alert('እባክዎ ሆቴሉን ይምረጡ!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRoom,
          hotel_id: parseInt(targetHotelId, 10),
          price_per_night: parseFloat(newRoom.price_per_night),
          capacity: parseInt(newRoom.capacity, 10),
          amenities: newRoom.amenities.split(',').map(a => a.trim())
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('አዲስ ክፍል በተሳካ ሁኔታ ተመዝግቧል!');
        setShowAddRoomModal(false);
        fetchRooms();
        fetchAdminData();
      }
    } catch (err) {
      alert('ክፍሉን መመዝገብ አልተቻለም');
    }
  };

  // ==============================================================================
  // AUTHENTICATION GATE: IF USER IS NOT LOGGED IN, SHOW AUTH PORTAL ONLY
  // ==============================================================================
  if (!user) {
    return (
      <div style={styles.authPortalContainer}>
        <div style={styles.authPortalBackground}>
          <div style={styles.authPortalOverlay}>
            <div style={styles.authPortalCard}>
              {/* BRAND HEADER */}
              <div style={styles.authPortalHeader}>
                <div style={styles.authLogoIcon}>
                  <Hotel size={36} color="#ffffff" />
                </div>
                <h1 style={styles.authPortalTitle}>Ethiopian Luxury Hotel Collection</h1>
                <p style={styles.authPortalSubtitle}>
                  የአዲስ አበባ ምርጥ ሆቴሎች ማስያዣ እና መቆጣጠሪያ ፕላትፎርም
                </p>
                <div style={styles.authPortalNotice}>
                  🔒 ወደ ድረ-ገጹ ለመግባት እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ ወይም አዲስ ይመዝገቡ
                </div>
              </div>

              {/* TABS: SIGN IN vs SIGN UP */}
              <div style={styles.authTabContainer}>
                <button 
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={authMode === 'login' ? styles.authTabActive : styles.authTabInactive}
                >
                  <LogIn size={16} /> ወደ ሲስተሙ ግባ (Sign In)
                </button>
                <button 
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  style={authMode === 'register' ? styles.authTabActive : styles.authTabInactive}
                >
                  <UserPlus size={16} /> አዲስ ተመዝገብ (Sign Up)
                </button>
              </div>

              {authError && <div style={styles.errorAlert}>{authError}</div>}

              <form onSubmit={handleAuthSubmit} style={styles.bookingForm}>
                {/* REGISTRATION ONLY FIELDS: FULL NAME & PHONE */}
                {authMode === 'register' && (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>ሙሉ ስም (Full Name) *</label>
                      <input 
                        type="text" 
                        placeholder="ምሳሌ፡ አበበ ከበደ (Abebe Kebede)"
                        value={authName} 
                        onChange={(e) => setAuthName(e.target.value)}
                        required 
                        style={styles.modalInput}
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>ስልክ ቁጥር (Phone Number)</label>
                      <input 
                        type="tel" 
                        placeholder="+251 91 123 4567"
                        value={authPhone} 
                        onChange={(e) => setAuthPhone(e.target.value)}
                        style={styles.modalInput}
                      />
                    </div>
                  </>
                )}

                {/* EMAIL FIELD */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>ኢሜይል (Email Address) *</label>
                  <input 
                    type="email" 
                    placeholder={authMode === 'login' ? "የእርስዎ ኢሜይል (ምሳሌ: abebe00@gmail.com)" : "ምሳሌ፡ abebe00@gmail.com"}
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required 
                    style={styles.modalInput}
                  />
                </div>

                {/* PASSWORD FIELD */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>የይለፍ ቃል (Password) *</label>
                  <input 
                    type="password" 
                    placeholder={authMode === 'login' ? "የይለፍ ቃልዎን ያስገቡ" : "ቢያንስ 6 ፊደላት ወይም ቁጥሮች"}
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required 
                    style={styles.modalInput}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button type="submit" style={styles.confirmBtn} disabled={isSubmittingAuth}>
                  {isSubmittingAuth 
                    ? 'እየተረጋገጠ ነው...' 
                    : (authMode === 'login' ? '🔑 ወደ ድረ-ገጹ ግባ (Sign In)' : '✨ አካውንት ክፈትና ግባ (Sign Up)')}
                </button>

                {/* SWITCH MODE PROMPT */}
                <div style={styles.authSwitchPrompt}>
                  {authMode === 'login' ? (
                    <span>
                      አዲስ ተጠቃሚ ነዎት?{' '}
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('register'); setAuthError(''); }}
                        style={styles.authSwitchBtn}
                      >
                        አሁኑኑ በነፃ ይመዝገቡ (Sign Up)
                      </button>
                    </span>
                  ) : (
                    <span>
                      አስቀድመው አካውንት አለዎት?{' '}
                      <button 
                        type="button" 
                        onClick={() => { setAuthMode('login'); setAuthError(''); }}
                        style={styles.authSwitchBtn}
                      >
                        ወደ ሲስተሙ ይግቡ (Sign In)
                      </button>
                    </span>
                  )}
                </div>

                {/* QUICK DEMO LOGINS */}
                {authMode === 'login' && (
                  <div style={styles.demoLoginBox}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f59e0b' }}>
                      ⚡ ፈጣን የመግቢያ አማራጮች (ጠቅ ያድርጉ)፦
                    </p>
                    <div style={styles.demoButtonsGrid}>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('abebe00@gmail.com', 'password123')}
                        style={styles.demoPillGreen}
                      >
                        👤 የተመዘገበ ደንበኛ (Customer: abebe00@gmail.com)
                      </button>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('superadmin@platform.com', 'super123')}
                        style={styles.demoPillGold}
                      >
                        👑 ሱፐር አድሚን (ሁሉንም የአዲስ አበባ ሆቴሎች መቆጣጠሪያ)
                      </button>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('admin.skylight@hotel.com', 'skylight123')}
                        style={styles.demoPill}
                      >
                        🏨 የስካይላይት ሆቴል አድሚን (Skylight Admin)
                      </button>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('admin.sheraton@hotel.com', 'sheraton123')}
                        style={styles.demoPill}
                      >
                        🏨 የሸራተን ሆቴል አድሚን (Sheraton Admin)
                      </button>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('admin.hyatt@hotel.com', 'hyatt123')}
                        style={styles.demoPill}
                      >
                        🏨 የሃያት ሪጀንሲ አድሚን (Hyatt Admin)
                      </button>
                      <button 
                        type="button"
                        onClick={() => quickLoginAs('admin.radisson@hotel.com', 'radisson123')}
                        style={styles.demoPill}
                      >
                        🏨 የራዲሰን ብሉ አድሚን (Radisson Admin)
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {/* 1. TOP PLATFORM NAVBAR */}
      <header style={styles.navbar}>
        <div style={styles.navBrand} onClick={() => setView('browse')}>
          <div style={styles.logoIcon}>
            <Hotel size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={styles.brandTitle}>Ethiopian Luxury Hotel Collection</h1>
            <span style={styles.brandSubtitle}>የኢትዮጵያ ምርጥ ሆቴሎች ማስያዣ እና መቆጣጠሪያ ፕላትፎርም</span>
          </div>
        </div>

        <nav style={styles.navMenu}>
          <button 
            style={view === 'browse' ? styles.navActiveBtn : styles.navBtn}
            onClick={() => handleViewChange('browse')}
          >
            🏨 ክፍሎች (Rooms)
          </button>

          <button 
            style={view === 'my-bookings' ? styles.navActiveBtn : styles.navBtn}
            onClick={() => handleViewChange('my-bookings')}
          >
            📅 የእኔ ማስያዣዎች (My Bookings)
          </button>

          {(user?.role === 'super_admin' || user?.role === 'hotel_admin') && (
            <button 
              style={view === 'admin' ? styles.navActiveBtnGold : styles.navBtn}
              onClick={() => handleViewChange('admin')}
            >
              {user.role === 'super_admin' ? (
                <>👑 የሱፐር አድሚን ዳሽቦርድ (All Hotels)</>
              ) : (
                <>⚙️ የ{user.hotel_name || 'ሆቴል'} ዳሽቦርድ</>
              )}
            </button>
          )}

          <div style={styles.userSection}>
            {user.role === 'super_admin' && (
              <span style={styles.superBadge}>👑 Super Admin</span>
            )}
            {user.role === 'hotel_admin' && (
              <span style={styles.hotelAdminBadge}>🏨 {user.hotel_name}</span>
            )}
            {user.role === 'customer' && (
              <span style={styles.customerBadge}>👤 ደንበኛ</span>
            )}
            <span style={styles.userNameBadge}>
              👤 {user.name}
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn} title="ከሲስተሙ ውጣ">
              <LogOut size={16} /> ውጣ (Logout)
            </button>
          </div>
        </nav>
      </header>

      {/* 2. HERO & MULTI-HOTEL SEARCH SECTION */}
      {view === 'browse' && (
        <>
          <section style={styles.heroSection}>
            <div style={styles.heroOverlay}>
              <span style={styles.heroBadge}>✨ Addis Ababa Premier Luxury Hotels</span>
              <h2 style={styles.heroHeading}>የአዲስ አበባን ምርጥ የቅንጦት ሆቴሎች በአንድ ቦታ ያግኙና ያስይዙ</h2>
              <p style={styles.heroText}>
                ከቦሌ፣ ከካዛንቺስ፣ ከመስቀል አደባባይ እና ከቂርቆስ የተመረጡ ባለ 5 ኮከብ ሆቴሎችን በቴሌብር እና በኢትዮጵያ ንግድ ባንክ በቀላሉ ያስይዙ።
              </p>

              {/* MULTI-HOTEL SEARCH CARD */}
              <div style={styles.searchCard}>
                <div style={styles.searchGrid}>
                  {/* HOTEL SELECTOR */}
                  <div style={styles.searchField}>
                    <label style={styles.searchLabel}>
                      <Hotel size={15} color="#2563eb" /> ሆቴል ምረጥ (Select Hotel)
                    </label>
                    <select 
                      value={selectedHotel} 
                      onChange={(e) => setSelectedHotel(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="All">🏨 ሁሉም የአዲስ አበባ ሆቴሎች (All Hotels: {hotels.length})</option>
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CITY / AREA SELECTOR */}
                  <div style={styles.searchField}>
                    <label style={styles.searchLabel}>
                      <MapPin size={15} color="#2563eb" /> አካባቢ / ዞን (Area in Addis)
                    </label>
                    <select 
                      value={selectedCity} 
                      onChange={(e) => setSelectedCity(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="All">ሁሉም አካባቢዎች (All Addis Ababa)</option>
                      <option value="Bole">ቦሌ (Bole / Airport Area)</option>
                      <option value="Kazanchis">ካዛንቺስ (Kazanchis / UNECA)</option>
                      <option value="Meskel Square">መስቀል አደባባይ (Meskel Square)</option>
                      <option value="Kirkos">ቂርቆስ / ምኒልክ ጎዳና (Kirkos / Menelik II)</option>
                    </select>
                  </div>

                  {/* ROOM TYPE */}
                  <div style={styles.searchField}>
                    <label style={styles.searchLabel}>
                      <Filter size={15} color="#2563eb" /> የክፍል አይነት (Type)
                    </label>
                    <select 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="All">ሁሉም ዓይነቶች</option>
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Suite">Suite</option>
                      <option value="Presidential">Presidential Villa</option>
                      <option value="Family">Family Villa</option>
                    </select>
                  </div>

                  {/* AVAILABILITY */}
                  <div style={styles.searchField}>
                    <label style={styles.searchLabel}>
                      <ShieldCheck size={15} color="#2563eb" /> የክፍል ሁኔታ (Status)
                    </label>
                    <select 
                      value={availabilityFilter} 
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="All">ሁሉም ክፍሎች (All: {roomCounts.total})</option>
                      <option value="available">🟢 ክፍት ብቻ (Available: {roomCounts.available})</option>
                      <option value="booked">🔴 የተያዙ ብቻ (Booked: {roomCounts.booked})</option>
                    </select>
                  </div>

                  {/* PRICE RANGE */}
                  <div style={styles.searchField}>
                    <label style={styles.searchLabel}>
                      <DollarSign size={15} color="#2563eb" /> ከፍተኛ ዋጋ፦ {maxPrice.toLocaleString()} ETB
                    </label>
                    <input 
                      type="range" 
                      min="2000" 
                      max="15000" 
                      step="500"
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      style={styles.rangeInput}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ROOMS GRID */}
          <main style={styles.mainContent}>
            {/* SUMMARY & QUICK FILTERS */}
            <div style={styles.statusSummaryBar}>
              <div style={styles.summaryCounters}>
                <span style={styles.summaryItemTotal}>
                  🏨 ጠቅላላ ክፍሎች፦ <strong>{roomCounts.total}</strong>
                </span>
                <span style={styles.summaryItemAvailable}>
                  🟢 ክፍት (Available)፦ <strong>{roomCounts.available}</strong>
                </span>
                <span style={styles.summaryItemBooked}>
                  🔴 የተያዙ (Booked)፦ <strong>{roomCounts.booked}</strong>
                </span>
              </div>

              <div style={styles.filterPills}>
                <button
                  style={availabilityFilter === 'All' ? styles.pillActive : styles.pillInactive}
                  onClick={() => setAvailabilityFilter('All')}
                >
                  ሁሉም ({roomCounts.total})
                </button>
                <button
                  style={availabilityFilter === 'available' ? styles.pillActiveGreen : styles.pillInactive}
                  onClick={() => setAvailabilityFilter('available')}
                >
                  🟢 ክፍት ብቻ ({roomCounts.available})
                </button>
                <button
                  style={availabilityFilter === 'booked' ? styles.pillActiveRed : styles.pillInactive}
                  onClick={() => setAvailabilityFilter('booked')}
                >
                  🔴 የተያዙ ብቻ ({roomCounts.booked})
                </button>
              </div>
            </div>

            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>
                  {availabilityFilter === 'available' && '🟢 ክፍት የሆኑ ክፍሎች ብቻ'}
                  {availabilityFilter === 'booked' && '🔴 የተያዙ ክፍሎች ዝርዝር'}
                  {availabilityFilter === 'All' && '🏨 የተዘረዘሩ ክፍሎች'}
                  {' '}({rooms.length})
                </h3>
                <p style={styles.sectionSubtitle}>
                  በኢትዮጵያ ታዋቂ ሆቴሎች ውስጥ የሚገኙ ክፍሎችን ይምረጡና በጥቂት ሰከንዶች ውስጥ ያስይዙ
                </p>
              </div>
            </div>

            {loadingRooms ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <p>ክፍሎች ከ PostgreSQL ዳታቤዝ እየተጫኑ ነው...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div style={styles.emptyBox}>
                <AlertCircle size={40} color="#94a3b8" />
                <h4>በተመረጠው መስፈርት የተገኘ ክፍል የለም</h4>
                <p>እባክዎ የተመረጠውን ሆቴል ወይም የዋጋ ወሰኑን ይቀይሩ።</p>
              </div>
            ) : (
              <div style={styles.roomGrid}>
                {rooms.map(room => {
                  const isBooked = room.booking_status === 'booked';

                  return (
                    <div 
                      key={room.id} 
                      style={{
                        ...styles.roomCard,
                        border: isBooked ? '1px solid #7f1d1d' : '1px solid #166534',
                        opacity: isBooked && availabilityFilter === 'All' ? 0.94 : 1
                      }}
                    >
                      <div style={styles.imageWrapper}>
                        <img src={room.image_url} alt={room.title} style={styles.roomImage} />
                        
                        {/* HOTEL BADGE */}
                        <span style={styles.hotelNameBadge}>
                          🏨 {room.hotel_name} • {room.hotel_city}
                        </span>

                        <span style={styles.roomNumberBadge}>ክፍል #{room.room_number}</span>

                        {/* STATUS BADGE */}
                        {isBooked ? (
                          <span style={styles.bookedBadge}>
                            🔒 የተያዘ (Booked)
                          </span>
                        ) : (
                          <span style={styles.availableBadge}>
                            🟢 ክፍት (Available)
                          </span>
                        )}
                      </div>

                      <div style={styles.cardBody}>
                        <div style={styles.priceRow}>
                          <div>
                            <span style={styles.priceAmount}>{parseFloat(room.price_per_night).toLocaleString()} ETB</span>
                            <span style={styles.pricePerNight}> / ሌሊት</span>
                          </div>
                          <span style={styles.capacityBadge}>
                            <Users size={14} /> ለ {room.capacity} ሰው
                          </span>
                        </div>

                        <h4 style={styles.roomTitle}>{room.title}</h4>
                        <p style={styles.roomDesc}>{room.description}</p>

                        {/* BOOKING INFO NOTICE IF BOOKED */}
                        {isBooked && (
                          <div style={styles.bookedNoticeBox}>
                            <div style={styles.bookedNoticeTitle}>
                              ⚠️ ይህ ክፍል በደንበኛ ተይዟል (Reserved)
                            </div>
                            {room.booked_by && (
                              <div style={styles.bookedNoticeDetail}>
                                👤 <strong>የያዘው ደንበኛ፦</strong> {room.booked_by}
                              </div>
                            )}
                            {room.booked_from && (
                              <div style={styles.bookedNoticeDetail}>
                                📅 <strong>የተያዘበት፦</strong> {new Date(room.booked_from).toLocaleDateString()} - {new Date(room.booked_to).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}

                        <div style={styles.amenitiesList}>
                          {room.amenities?.map((amenity, idx) => (
                            <span key={idx} style={styles.amenityBadge}>
                              ✓ {amenity}
                            </span>
                          ))}
                        </div>

                        {/* ACTION BUTTON */}
                        {isBooked ? (
                          <button 
                            disabled
                            style={styles.disabledBookedBtn}
                            title="ይህ ክፍል አስቀድሞ ተይዟል"
                          >
                            🔒 ተይዟል (Already Booked)
                          </button>
                        ) : (
                          <button 
                            style={styles.bookNowBtn}
                            onClick={() => {
                              setBookingRoom(room);
                              setBookingSuccess(null);
                              setBookingError('');
                              const today = new Date().toISOString().split('T')[0];
                              const tmrw = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                              setCheckIn(today);
                              setCheckOut(tmrw);
                            }}
                          >
                            አሁን አስይዝ (Book Now) <ChevronRight size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* 3. MY BOOKINGS VIEW */}
      {view === 'my-bookings' && (
        <main style={styles.mainContent}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>📅 የእኔ የተያዙ ክፍሎች (My Reservations)</h3>
              <p style={styles.sectionSubtitle}>የያዟቸውን ክፍሎች መረጃ፣ የሆቴላቸውን ስም እና የማስያዣ ቁጥራቸውን እዚህ ያረጋግጡ</p>
            </div>
            <button onClick={() => fetchMyBookings()} style={styles.secondaryBtn}>🔄 አድስ (Refresh)</button>
          </div>

          {loadingMyBookings ? (
            <div style={styles.loadingBox}><p>መረጃዎች በመጫን ላይ ናቸው...</p></div>
          ) : myBookings.length === 0 ? (
            <div style={styles.emptyBox}>
              <Bed size={48} color="#94a3b8" />
              <h4>እስካሁን ያስያዙት ክፍል የለም</h4>
              <p>የኢትዮጵያ ምርጥ ሆቴሎችን ክፍሎች ተመልክተው በቀላሉ ማስያዝ ይችላሉ።</p>
              <button onClick={() => setView('browse')} style={styles.bookNowBtn}>ክፍሎችን ተመልከት</button>
            </div>
          ) : (
            <div style={styles.myBookingsList}>
              {myBookings.map(b => (
                <div key={b.id} style={styles.bookingCard}>
                  <img src={b.image_url} alt={b.room_title} style={styles.bookingThumb} />
                  <div style={styles.bookingDetails}>
                    <div style={styles.bookingTopRow}>
                      <span style={styles.refTag}>Ref: {b.booking_reference}</span>
                      <span style={b.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled}>
                        {b.status === 'confirmed' ? '✅ የጸደቀ (Confirmed)' : '❌ የተሰረዘ (Cancelled)'}
                      </span>
                    </div>

                    <h4 style={styles.bookingTitle}>{b.room_title} (ክፍል #{b.room_number})</h4>
                    <p style={styles.hotelSubtext}>🏨 <strong>ሆቴል፦</strong> {b.hotel_name} ({b.hotel_city}) • 📞 {b.hotel_phone}</p>
                    
                    <div style={styles.bookingInfoGrid}>
                      <div>📅 <strong>መግቢያ (Check-in):</strong> {new Date(b.check_in).toLocaleDateString()}</div>
                      <div>📅 <strong>መውጫ (Check-out):</strong> {new Date(b.check_out).toLocaleDateString()}</div>
                      <div>👥 <strong>እንግዶች:</strong> {b.guests_count} ሰው</div>
                      <div>💳 <strong>ክፍያ:</strong> {b.payment_method.toUpperCase()} (ተከፍሏል)</div>
                    </div>

                    <div style={styles.bookingBottomRow}>
                      <span style={styles.totalPriceText}>ጠቅላላ ክፍያ፦ {parseFloat(b.total_price).toLocaleString()} ETB</span>
                      {b.status === 'confirmed' && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          style={styles.cancelBookingBtn}
                        >
                          ማስያዣውን ሰርዝ (Cancel)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* 4. ADMIN DASHBOARD VIEW (Super Admin vs Hotel Admin) */}
      {view === 'admin' && (
        <main style={styles.mainContent}>
          {/* ROLE BANNER */}
          <div style={user?.role === 'super_admin' ? styles.superAdminBanner : styles.hotelAdminBanner}>
            <div>
              <h3 style={styles.adminBannerHeading}>
                {user?.role === 'super_admin' ? (
                  <>👑 የፕላትፎርም የበላይ አስተዳዳሪ (Platform Super Admin)</>
                ) : (
                  <>🏨 {user?.hotel_name} አስተዳዳሪ ({user?.hotel_city})</>
                )}
              </h3>
              <p style={styles.adminBannerSub}>
                {user?.role === 'super_admin' 
                  ? 'በሲስተሙ ውስጥ ያሉትን ሁሉንም 4 ሆቴሎች፣ አስተዳዳሪዎችን፣ ክፍሎችን እና ጠቅላላ ገቢዎችን ይቆጣጠሩ።'
                  : `የ ${user?.hotel_name} ክፍሎችን እና የገቡ ማስያዣዎችን ብቻ ያስተዳድሩ።`}
              </p>
            </div>

            <div style={styles.adminActionBtns}>
              {user?.role === 'super_admin' && (
                <button 
                  onClick={() => setShowAddHotelModal(true)} 
                  style={styles.addHotelBtn}
                >
                  <PlusCircle size={18} /> አዲስ ሆቴል ጨምር (Add Hotel)
                </button>
              )}

              <button 
                onClick={() => {
                  setNewRoom({
                    ...newRoom,
                    hotel_id: user?.hotel_id || (hotels[0]?.id || '')
                  });
                  setShowAddRoomModal(true);
                }} 
                style={styles.addRoomBtn}
              >
                <PlusCircle size={18} /> አዲስ ክፍል ጨምር (Add Room)
              </button>
            </div>
          </div>

          {/* SUPER ADMIN: HOTEL SELECTOR FOR FILTERING DASHBOARD */}
          {user?.role === 'super_admin' && (
            <div style={styles.superFilterBar}>
              <span style={styles.superFilterLabel}>የሆቴል ዳሽቦርድ አጣራ፦</span>
              <select 
                value={adminSelectedHotelFilter} 
                onChange={(e) => {
                  setAdminSelectedHotelFilter(e.target.value);
                  fetchAdminData(e.target.value);
                }}
                style={styles.selectInput}
              >
                <option value="All">🌐 ሁሉንም 4 ሆቴሎች በአንድ ላይ አሳይ (Global Overview)</option>
                {hotels.map(h => (
                  <option key={h.id} value={h.id}>🏨 {h.name} ({h.city})</option>
                ))}
              </select>
            </div>
          )}

          {/* STATS TILES */}
          {adminStats && (
            <div style={styles.statsGrid}>
              {user?.role === 'super_admin' && (
                <div style={styles.statCard}>
                  <div style={styles.statIconWrapperPurple}><Building2 size={24} color="#9333ea" /></div>
                  <div>
                    <span style={styles.statLabel}>ጠቅላላ ሆቴሎች</span>
                    <h4 style={styles.statValue}>{adminStats.totalHotels}</h4>
                  </div>
                </div>
              )}

              <div style={styles.statCard}>
                <div style={styles.statIconWrapperBlue}><Bed size={24} color="#2563eb" /></div>
                <div>
                  <span style={styles.statLabel}>ጠቅላላ ክፍሎች</span>
                  <h4 style={styles.statValue}>{adminStats.totalRooms}</h4>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIconWrapperGreen}><CheckCircle2 size={24} color="#16a34a" /></div>
                <div>
                  <span style={styles.statLabel}>ንቁ ማስያዣዎች</span>
                  <h4 style={styles.statValue}>{adminStats.activeBookings}</h4>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIconWrapperPurple}><Sparkles size={24} color="#9333ea" /></div>
                <div>
                  <span style={styles.statLabel}>ተይዞ የመገኘት ምጣኔ</span>
                  <h4 style={styles.statValue}>{adminStats.occupancyRate}%</h4>
                </div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statIconWrapperAmber}><DollarSign size={24} color="#d97706" /></div>
                <div>
                  <span style={styles.statLabel}>ጠቅላላ ገቢ</span>
                  <h4 style={styles.statValue}>{adminStats.totalRevenue.toLocaleString()} ETB</h4>
                </div>
              </div>
            </div>
          )}

          {/* SUPER ADMIN: ALL HOTELS MANAGEMENT TABLE */}
          {user?.role === 'super_admin' && adminHotelBreakdown.length > 0 && (
            <div style={{ ...styles.adminTableCard, marginBottom: '30px' }}>
              <h4 style={styles.tableCardTitle}>🏨 በሲስተሙ የተመዘገቡ ሆቴሎች እና ስራ አስኪያጆቻቸው (All Hotels Directory)</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>የሆቴል ስም</th>
                      <th style={styles.th}>ከተማ</th>
                      <th style={styles.th}>ክፍሎች ብዛት</th>
                      <th style={styles.th}>ጠቅላላ ማስያዣ</th>
                      <th style={styles.th}>የተሰበሰበ ገቢ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminHotelBreakdown.map(h => (
                      <tr key={h.id} style={styles.tr}>
                        <td style={styles.td}>#{h.id}</td>
                        <td style={{ ...styles.td, fontWeight: 'bold' }}>{h.name}</td>
                        <td style={styles.td}><span style={styles.cityTag}>{h.city}</span></td>
                        <td style={styles.td}>{h.rooms_count} ክፍሎች</td>
                        <td style={styles.td}>{h.bookings_count} ማስያዣዎች</td>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#38bdf8' }}>
                          {parseFloat(h.revenue).toLocaleString()} ETB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALL BOOKINGS TABLE */}
          <div style={styles.adminTableCard}>
            <h4 style={styles.tableCardTitle}>
              📋 የማስያዣዎች ዝርዝር ({allBookings.length})
              {user?.role === 'hotel_admin' && ` — ${user?.hotel_name} ብቻ`}
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Ref ID</th>
                    {user?.role === 'super_admin' && <th style={styles.th}>ሆቴል</th>}
                    <th style={styles.th}>የደንበኛ ስም</th>
                    <th style={styles.th}>ስልክ ቁጥር</th>
                    <th style={styles.th}>ክፍል</th>
                    <th style={styles.th}>መግቢያ</th>
                    <th style={styles.th}>መውጫ</th>
                    <th style={styles.th}>ዋጋ</th>
                    <th style={styles.th}>ሁኔታ</th>
                    <th style={styles.th}>እርምጃ</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map(b => (
                    <tr key={b.id} style={styles.tr}>
                      <td style={styles.td}><code>{b.booking_reference}</code></td>
                      {user?.role === 'super_admin' && (
                        <td style={{ ...styles.td, color: '#38bdf8', fontWeight: 'bold' }}>
                          {b.hotel_name}
                        </td>
                      )}
                      <td style={{ ...styles.td, fontWeight: 'bold' }}>{b.customer_name}</td>
                      <td style={styles.td}>{b.customer_phone}</td>
                      <td style={styles.td}>{b.room_title} (#{b.room_number})</td>
                      <td style={styles.td}>{new Date(b.check_in).toLocaleDateString()}</td>
                      <td style={styles.td}>{new Date(b.check_out).toLocaleDateString()}</td>
                      <td style={{ ...styles.td, fontWeight: 'bold', color: '#16a34a' }}>
                        {parseFloat(b.total_price).toLocaleString()} ETB
                      </td>
                      <td style={styles.td}>
                        <span style={b.status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled}>
                          {b.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {b.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancelBooking(b.id)}
                            style={styles.cancelSmallBtn}
                          >
                            ሰርዝ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* 5. BOOKING MODAL */}
      {bookingRoom && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>ክፍል ማስያዣ (Confirm Reservation)</h3>
              <button onClick={() => setBookingRoom(null)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            {bookingSuccess ? (
              <div style={styles.successBox}>
                <CheckCircle2 size={54} color="#16a34a" />
                <h4 style={styles.successTitle}>እንኳን ደስ አለዎት! ክፍሉ በተሳካ ሁኔታ ተይዟል።</h4>
                <p style={styles.successRef}>የማስያዣ ቁጥርዎ (Booking Ref): <strong>{bookingSuccess.booking.booking_reference}</strong></p>
                <div style={styles.successDetails}>
                  <p>🏨 <strong>ሆቴል፦</strong> {bookingSuccess.hotel_name}</p>
                  <p>🛏️ <strong>ክፍል፦</strong> {bookingSuccess.room_title}</p>
                  <p>📅 <strong>ቀናት፦</strong> {bookingSuccess.nights} ሌሊቶች</p>
                  <p>💰 <strong>ጠቅላላ ክፍያ፦</strong> {parseFloat(bookingSuccess.booking.total_price).toLocaleString()} ETB</p>
                  <p>📱 <strong>የክፍያ መንገድ፦</strong> {bookingSuccess.booking.payment_method.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => { setBookingRoom(null); setView('my-bookings'); fetchMyBookings(); }}
                  style={styles.bookNowBtn}
                >
                  የእኔ ማስያዣዎች ውስጥ ተመልከት
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={styles.bookingForm}>
                <div style={styles.selectedRoomBanner}>
                  <img src={bookingRoom.image_url} alt="" style={styles.bannerThumb} />
                  <div>
                    <span style={styles.miniHotelTag}>🏨 {bookingRoom.hotel_name} ({bookingRoom.hotel_city})</span>
                    <h4 style={styles.bannerTitle}>{bookingRoom.title}</h4>
                    <p style={styles.bannerSub}>ክፍል #{bookingRoom.room_number} • {bookingRoom.room_type} • {parseFloat(bookingRoom.price_per_night).toLocaleString()} ETB / ሌሊት</p>
                  </div>
                </div>

                {bookingError && <div style={styles.errorAlert}>{bookingError}</div>}

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>የመግቢያ ቀን (Check-in) *</label>
                    <input 
                      type="date" 
                      value={checkIn} 
                      onChange={(e) => setCheckIn(e.target.value)}
                      required 
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>የመውጫ ቀን (Check-out) *</label>
                    <input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)}
                      required 
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>የደንበኛ ሙሉ ስም *</label>
                  <input 
                    type="text" 
                    placeholder="ምሳሌ፡ አበበ ከበደ"
                    value={customerName} 
                    onChange={(e) => setCustomerName(e.target.value)}
                    required 
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ኢሜይል *</label>
                    <input 
                      type="email" 
                      placeholder="abebe@example.com"
                      value={customerEmail} 
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required 
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ስልክ ቁጥር (Phone) *</label>
                    <input 
                      type="tel" 
                      placeholder="+251 9..."
                      value={customerPhone} 
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required 
                      style={styles.modalInput}
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>የቀበሌ መታወቂያ ወይም የፓስፖርት ቁጥር (Kebele ID / Passport No) *</label>
                  <input 
                    type="text" 
                    placeholder="ምሳሌ፡ ETH-984214 ወይም AA/BOLE/10293"
                    value={kebeleId} 
                    onChange={(e) => setKebeleId(e.target.value)}
                    required 
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>የክፍያ አማራጭ (Payment Method)</label>
                  <div style={styles.paymentMethodsGrid}>
                    <label style={paymentMethod === 'telebirr' ? styles.payOptionActive : styles.payOption}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="telebirr" 
                        checked={paymentMethod === 'telebirr'} 
                        onChange={() => setPaymentMethod('telebirr')}
                      />
                      <span>📱 Telebirr (ቴሌብር)</span>
                    </label>

                    <label style={paymentMethod === 'cbe' ? styles.payOptionActive : styles.payOption}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="cbe" 
                        checked={paymentMethod === 'cbe'} 
                        onChange={() => setPaymentMethod('cbe')}
                      />
                      <span>🏦 CBE Birr (ንግድ ባንክ)</span>
                    </label>

                    <label style={paymentMethod === 'cash' ? styles.payOptionActive : styles.payOption}>
                      <input 
                        type="radio" 
                        name="pay" 
                        value="cash" 
                        checked={paymentMethod === 'cash'} 
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <span>💵 በሆቴሉ በግንባር ክፈል</span>
                    </label>
                  </div>
                </div>

                <div style={styles.priceSummaryBox}>
                  <div style={styles.priceRowItem}>
                    <span>የቀናት ብዛት፦</span>
                    <strong>{calculateBookingTotal().nights} ሌሊቶች</strong>
                  </div>
                  <div style={styles.priceRowItem}>
                    <span>ጠቅላላ ክፍያ (Total Price)፦</span>
                    <strong style={styles.grandPrice}>{calculateBookingTotal().total.toLocaleString()} ETB</strong>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingBooking}
                  style={styles.confirmBtn}
                >
                  {isSubmittingBooking ? 'በማስያዝ ላይ...' : '✓ ማስያዣውን አረጋግጥና ክፈል'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. SUPER ADMIN: ADD HOTEL MODAL */}
      {showAddHotelModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>👑 አዲስ ሆቴል ወደ ፕላትፎርሙ ጨምር (Add New Hotel)</h3>
              <button onClick={() => setShowAddHotelModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddHotel} style={styles.bookingForm}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>የሆቴሉ ስም *</label>
                  <input 
                    type="text" 
                    placeholder="ምሳሌ፡ Haile Grand Resort"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>ከተማ (City) *</label>
                  <input 
                    type="text" 
                    placeholder="ምሳሌ፡ Hawassa"
                    value={newHotel.city}
                    onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>ስልክ ቁጥር</label>
                  <input 
                    type="text" 
                    value={newHotel.phone}
                    onChange={(e) => setNewHotel({ ...newHotel, phone: e.target.value })}
                    style={styles.modalInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>የኮከብ ደረጃ (Stars)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5"
                    value={newHotel.star_rating}
                    onChange={(e) => setNewHotel({ ...newHotel, star_rating: parseFloat(e.target.value) })}
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>የሆቴል ፎቶ ሊንክ (Image URL)</label>
                <input 
                  type="url" 
                  value={newHotel.image_url}
                  onChange={(e) => setNewHotel({ ...newHotel, image_url: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              {/* MANAGER ASSIGNMENT */}
              <div style={{ ...styles.priceSummaryBox, marginTop: '10px' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#38bdf8' }}>👤 ለዚህ ሆቴል ኃላፊ/አድሚን ይመድቡ</h5>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>የስራ አስኪያጁ ኢሜይል</label>
                    <input 
                      type="email" 
                      placeholder="admin.hawassa@hotel.com"
                      value={newHotel.manager_email}
                      onChange={(e) => setNewHotel({ ...newHotel, manager_email: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>የይለፍ ቃል</label>
                    <input 
                      type="password" 
                      placeholder="password123"
                      value={newHotel.manager_password}
                      onChange={(e) => setNewHotel({ ...newHotel, manager_password: e.target.value })}
                      style={styles.modalInput}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" style={styles.confirmBtn}>
                💾 ሆቴሉን እና አስተዳዳሪውን መዝግብ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. ADD ROOM MODAL (Admin) */}
      {showAddRoomModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>አዲስ ክፍል ወደ ዳታቤዝ ጨምር (Add Room)</h3>
              <button onClick={() => setShowAddRoomModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddRoom} style={styles.bookingForm}>
              {user?.role === 'super_admin' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>ክፍሉ የሚጨመርበት ሆቴል *</label>
                  <select 
                    value={newRoom.hotel_id}
                    onChange={(e) => setNewRoom({ ...newRoom, hotel_id: e.target.value })}
                    required
                    style={styles.modalInput}
                  >
                    <option value="">-- ሆቴል ይምረጡ --</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>🏨 {h.name} ({h.city})</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>የክፍል ቁጥር (Room #) *</label>
                  <input 
                    type="text" 
                    placeholder="ምሳሌ፡ 501"
                    value={newRoom.room_number}
                    onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>የክፍል አይነት (Type) *</label>
                  <select 
                    value={newRoom.room_type}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value })}
                    style={styles.modalInput}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>የክፍሉ መጠሪያ ስም (Title) *</label>
                <input 
                  type="text" 
                  placeholder="ምሳሌ፡ Panoramic Lake View Suite"
                  value={newRoom.title}
                  onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                  required
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>የአንድ ሌሊት ዋጋ (ETB) *</label>
                  <input 
                    type="number" 
                    placeholder="3500"
                    value={newRoom.price_per_night}
                    onChange={(e) => setNewRoom({ ...newRoom, price_per_night: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>የሰው ብዛት (Capacity) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newRoom.capacity}
                    onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                    required
                    style={styles.modalInput}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>አገልግሎቶች (Amenities - በኮማ ይለዩ)</label>
                <input 
                  type="text" 
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>የምስል ሊንክ (Image URL)</label>
                <input 
                  type="url" 
                  value={newRoom.image_url}
                  onChange={(e) => setNewRoom({ ...newRoom, image_url: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <button type="submit" style={styles.confirmBtn}>
                💾 ክፍሉን ወደ PostgreSQL ዳታቤዝ መዝግብ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. AUTH MODAL (Login/Register with Demo Credentials) */}
      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '480px' }}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {authMode === 'login' ? '🔑 ወደ ሲስተሙ ግባ (Sign In)' : '✨ አዲስ አካውንት ክፈት (Sign Up)'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} style={styles.closeBtn}><X size={20} /></button>
            </div>

            {/* TAB SELECTOR: SIGN IN vs SIGN UP */}
            <div style={styles.authTabContainer}>
              <button 
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(''); }}
                style={authMode === 'login' ? styles.authTabActive : styles.authTabInactive}
              >
                <LogIn size={16} /> ግባ (Sign In)
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(''); }}
                style={authMode === 'register' ? styles.authTabActive : styles.authTabInactive}
              >
                <UserPlus size={16} /> አዲስ ተመዝገብ (Sign Up)
              </button>
            </div>

            {authError && <div style={styles.errorAlert}>{authError}</div>}

            <form onSubmit={handleAuthSubmit} style={styles.bookingForm}>
              {/* REGISTRATION ONLY FIELDS: FULL NAME & PHONE */}
              {authMode === 'register' && (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>ሙሉ ስም (Full Name) *</label>
                    <input 
                      type="text" 
                      placeholder="ምሳሌ፡ አበበ ከበደ (Abebe Kebede)"
                      value={authName} 
                      onChange={(e) => setAuthName(e.target.value)}
                      required 
                      style={styles.modalInput}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ስልክ ቁጥር (Phone Number)</label>
                    <input 
                      type="tel" 
                      placeholder="+251 91 123 4567"
                      value={authPhone} 
                      onChange={(e) => setAuthPhone(e.target.value)}
                      style={styles.modalInput}
                    />
                  </div>
                </>
              )}

              {/* EMAIL FIELD */}
              <div style={styles.formGroup}>
                <label style={styles.label}>ኢሜይል (Email Address) *</label>
                <input 
                  type="email" 
                  placeholder={authMode === 'login' ? "የእርስዎ ኢሜይል ወይም የአድሚን ኢሜይል" : "ምሳሌ፡ abebe00@gmail.com"}
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required 
                  style={styles.modalInput}
                />
              </div>

              {/* PASSWORD FIELD */}
              <div style={styles.formGroup}>
                <label style={styles.label}>የይለፍ ቃል (Password) *</label>
                <input 
                  type="password" 
                  placeholder={authMode === 'login' ? "የይለፍ ቃልዎን ያስገቡ" : "ቢያንስ 6 ፊደላት ወይም ቁጥሮች"}
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required 
                  style={styles.modalInput}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button type="submit" style={styles.confirmBtn}>
                {authMode === 'login' ? '🔑 ወደ ሲስተሙ ግባ (Sign In)' : '✨ አካውንት ክፈትና ተመዝገብ (Sign Up)'}
              </button>

              {/* SWITCH MODE PROMPT */}
              <div style={styles.authSwitchPrompt}>
                {authMode === 'login' ? (
                  <span>
                    አዲስ ተጠቃሚ ነዎት?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      style={styles.authSwitchBtn}
                    >
                      አሁኑኑ በነፃ ይመዝገቡ (Sign Up)
                    </button>
                  </span>
                ) : (
                  <span>
                    አስቀድመው አካውንት አለዎት?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      style={styles.authSwitchBtn}
                    >
                      ወደ ሲስተሙ ይግቡ (Sign In)
                    </button>
                  </span>
                )}
              </div>

              {/* QUICK DEMO LOGINS (ONLY VISIBLE IN LOGIN MODE) */}
              {authMode === 'login' && (
                <div style={styles.demoLoginBox}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f59e0b' }}>⚡ በአዲስ አበባ ሆቴል አካውንቶች በፍጥነት ለመግባት ጠቅ ያድርጉ፦</p>
                  <div style={styles.demoButtonsGrid}>
                    <button 
                      type="button"
                      onClick={() => quickLoginAs('superadmin@platform.com', 'super123')}
                      style={styles.demoPillGold}
                    >
                      👑 ሱፐር አድሚን (ሁሉንም የአዲስ አበባ ሆቴሎች መቆጣጠሪያ)
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLoginAs('admin.skylight@hotel.com', 'skylight123')}
                      style={styles.demoPill}
                    >
                      🏨 የስካይላይት ሆቴል አድሚን (Skylight Admin)
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLoginAs('admin.sheraton@hotel.com', 'sheraton123')}
                      style={styles.demoPill}
                    >
                      🏨 የሸራተን ሆቴል አድሚን (Sheraton Admin)
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLoginAs('admin.hyatt@hotel.com', 'hyatt123')}
                      style={styles.demoPill}
                    >
                      🏨 የሃያት ሪጀንሲ አድሚን (Hyatt Admin)
                    </button>
                    <button 
                      type="button"
                      onClick={() => quickLoginAs('admin.radisson@hotel.com', 'radisson123')}
                      style={styles.demoPill}
                    >
                      🏨 የራዲሰን ብሉ አድሚን (Radisson Admin)
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// STYLES OBJECT
// ==============================================================================
const styles = {
  authPortalContainer: {
    minHeight: '100vh',
    width: '100%',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#0f172a',
    color: '#ffffff'
  },
  authPortalBackground: {
    minHeight: '100vh',
    width: '100%',
    backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  authPortalOverlay: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 16px'
  },
  authPortalCard: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
  },
  authPortalHeader: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  authLogoIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    backgroundColor: '#2563eb',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)'
  },
  authPortalTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px'
  },
  authPortalSubtitle: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 14px 0'
  },
  authPortalNotice: {
    fontSize: '12px',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    color: '#93c5fd',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  appContainer: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
    margin: 0,
    padding: 0
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  logoIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px'
  },
  brandSubtitle: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  navBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  navActiveBtn: {
    backgroundColor: '#2563eb',
    border: 'none',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px'
  },
  navActiveBtnGold: {
    backgroundColor: '#d97706',
    border: 'none',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0f172a',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid #334155'
  },
  superBadge: {
    backgroundColor: '#78350f',
    color: '#fbbf24',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '800'
  },
  hotelAdminBadge: {
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  userNameBadge: {
    fontSize: '13px',
    color: '#38bdf8',
    fontWeight: '600'
  },
  customerBadge: {
    backgroundColor: '#064e3b',
    color: '#a7f3d0',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#f87171',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'all 0.2s'
  },
  loginBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px'
  },
  signUpBtn: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
  },
  heroSection: {
    position: 'relative',
    backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '60px 20px 80px 20px',
    textAlign: 'center'
  },
  heroOverlay: {
    maxWidth: '1100px',
    margin: '0 auto',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    backdropFilter: 'blur(8px)',
    padding: '36px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  heroBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    color: '#60a5fa',
    border: '1px solid #2563eb',
    padding: '4px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '16px'
  },
  heroHeading: {
    fontSize: '34px',
    fontWeight: '900',
    margin: '0 0 12px 0',
    color: '#ffffff'
  },
  heroText: {
    fontSize: '16px',
    color: '#cbd5e1',
    maxWidth: '750px',
    margin: '0 auto 28px auto',
    lineHeight: 1.6
  },
  searchCard: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #334155',
    textAlign: 'left'
  },
  searchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
    alignItems: 'center'
  },
  searchField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  searchLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#cbd5e1',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  selectInput: {
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    color: '#ffffff',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  rangeInput: {
    width: '100%',
    cursor: 'pointer'
  },
  mainContent: {
    maxWidth: '1250px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  statusSummaryBar: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  summaryCounters: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
    fontSize: '14px'
  },
  summaryItemTotal: {
    backgroundColor: '#0f172a',
    padding: '6px 14px',
    borderRadius: '8px',
    color: '#cbd5e1',
    fontWeight: '600'
  },
  summaryItemAvailable: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    color: '#4ade80',
    border: '1px solid #16a34a',
    padding: '6px 14px',
    borderRadius: '8px',
    fontWeight: '700'
  },
  summaryItemBooked: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    border: '1px solid #ef4444',
    padding: '6px 14px',
    borderRadius: '8px',
    fontWeight: '700'
  },
  filterPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  pillActive: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pillActiveGreen: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pillActiveRed: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pillInactive: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    color: '#ffffff'
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  },
  roomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px'
  },
  roomCard: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column'
  },
  imageWrapper: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden'
  },
  roomImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  hotelNameBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#38bdf8',
    border: '1px solid #0284c7',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '800'
  },
  roomNumberBadge: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    color: '#cbd5e1',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  availableBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700'
  },
  bookedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700'
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  priceAmount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#38bdf8'
  },
  pricePerNight: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  capacityBadge: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  roomTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#ffffff'
  },
  roomDesc: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 16px 0',
    lineHeight: 1.5,
    flexGrow: 1
  },
  bookedNoticeBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '14px',
    fontSize: '12px',
    lineHeight: 1.6
  },
  bookedNoticeTitle: {
    color: '#f87171',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  bookedNoticeDetail: {
    color: '#cbd5e1'
  },
  amenitiesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '20px'
  },
  amenityBadge: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500'
  },
  bookNowBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  disabledBookedBtn: {
    backgroundColor: '#334155',
    color: '#94a3b8',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'not-allowed',
    width: '100%',
    textAlign: 'center'
  },
  superAdminBanner: {
    backgroundColor: '#78350f',
    border: '1px solid #b45309',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  hotelAdminBanner: {
    backgroundColor: '#1e3a8a',
    border: '1px solid #3b82f6',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  adminBannerHeading: {
    fontSize: '22px',
    fontWeight: '900',
    margin: '0 0 6px 0',
    color: '#ffffff'
  },
  adminBannerSub: {
    fontSize: '14px',
    color: '#e2e8f0',
    margin: 0
  },
  adminActionBtns: {
    display: 'flex',
    gap: '12px'
  },
  superFilterBar: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '14px 20px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  superFilterLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#f59e0b'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statIconWrapperBlue: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconWrapperGreen: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconWrapperPurple: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(147, 51, 234, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIconWrapperAmber: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: '13px', color: '#94a3b8' },
  statValue: { fontSize: '24px', fontWeight: '800', margin: '4px 0 0 0', color: '#ffffff' },
  adminTableCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '24px'
  },
  tableCardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#ffffff'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  thRow: {
    borderBottom: '2px solid #334155'
  },
  th: {
    padding: '12px',
    color: '#94a3b8',
    fontWeight: '600'
  },
  tr: {
    borderBottom: '1px solid #334155'
  },
  td: {
    padding: '12px',
    color: '#cbd5e1'
  },
  cityTag: {
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  cancelSmallBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  addHotelBtn: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  addRoomBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  myBookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  bookingCard: {
    backgroundColor: '#1e293b',
    borderRadius: '14px',
    border: '1px solid #334155',
    display: 'flex',
    overflow: 'hidden',
    gap: '20px'
  },
  bookingThumb: {
    width: '230px',
    height: '170px',
    objectFit: 'cover'
  },
  bookingDetails: {
    padding: '16px 20px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  bookingTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  refTag: {
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    padding: '2px 8px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '13px'
  },
  statusConfirmed: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    color: '#4ade80',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  bookingTitle: {
    fontSize: '18px',
    margin: '6px 0 2px 0',
    color: '#ffffff'
  },
  hotelSubtext: {
    fontSize: '13px',
    color: '#38bdf8',
    margin: '0 0 10px 0'
  },
  bookingInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
    fontSize: '13px',
    color: '#cbd5e1'
  },
  bookingBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px'
  },
  totalPriceText: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#38bdf8'
  },
  cancelBookingBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    color: '#ffffff'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer'
  },
  bookingForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  selectedRoomBanner: {
    display: 'flex',
    gap: '14px',
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '10px'
  },
  miniHotelTag: {
    display: 'inline-block',
    fontSize: '11px',
    color: '#38bdf8',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  bannerThumb: {
    width: '70px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover'
  },
  bannerTitle: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    color: '#ffffff'
  },
  bannerSub: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#cbd5e1'
  },
  modalInput: {
    backgroundColor: '#0f172a',
    border: '1px solid #475569',
    color: '#ffffff',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  paymentMethodsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  payOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    cursor: 'pointer',
    fontSize: '14px'
  },
  payOptionActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    border: '1px solid #2563eb',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#60a5fa'
  },
  priceSummaryBox: {
    backgroundColor: '#0f172a',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #334155',
    marginTop: '6px'
  },
  priceRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  grandPrice: {
    color: '#38bdf8',
    fontSize: '18px'
  },
  confirmBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '10px'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    border: '1px solid #ef4444',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px'
  },
  successBox: {
    textAlign: 'center',
    padding: '20px 0'
  },
  successTitle: {
    fontSize: '20px',
    color: '#ffffff',
    margin: '16px 0 8px 0'
  },
  successRef: {
    fontSize: '16px',
    color: '#38bdf8',
    marginBottom: '16px'
  },
  successDetails: {
    backgroundColor: '#0f172a',
    padding: '16px',
    borderRadius: '10px',
    textAlign: 'left',
    marginBottom: '20px',
    lineHeight: 1.8
  },
  secondaryBtn: {
    backgroundColor: '#334155',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  authTabContainer: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#0f172a',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '16px',
    border: '1px solid #334155'
  },
  authTabActive: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  authTabInactive: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  },
  authSwitchPrompt: {
    marginTop: '14px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8'
  },
  authSwitchBtn: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
    fontSize: '13px'
  },
  demoLoginBox: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#0f172a',
    borderRadius: '10px',
    border: '1px dashed #f59e0b',
    fontSize: '12px'
  },
  demoButtonsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  demoPillGreen: {
    backgroundColor: '#064e3b',
    color: '#a7f3d0',
    border: '1px solid #059669',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: '12px'
  },
  demoPillGold: {
    backgroundColor: '#78350f',
    color: '#fef3c7',
    border: '1px solid #b45309',
    padding: '8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'left',
    fontSize: '12px'
  },
  demoPill: {
    backgroundColor: '#1e293b',
    color: '#cbd5e1',
    border: '1px solid #334155',
    padding: '6px 10px',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '12px'
  },
  loadingBox: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#94a3b8'
  },
  emptyBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    border: '1px solid #334155'
  }
};
