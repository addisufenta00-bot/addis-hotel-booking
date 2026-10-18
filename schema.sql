-- ==============================================================================
-- MULTI-HOTEL PLATFORM SYSTEM - DATABASE SCHEMA (PostgreSQL)
-- Database Name: hotel_booking_db
-- ==============================================================================

-- 1. HOTELS TABLE (የሆቴሎች ሰንጠረዥ)
CREATE TABLE IF NOT EXISTS hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(200),
  star_rating NUMERIC(2, 1) DEFAULT 4.5,
  phone VARCHAR(50),
  email VARCHAR(100),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE (ሱፐር አድሚን፣ የሆቴል አድሚን እና ደንበኞች)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(30) DEFAULT 'customer', -- 'super_admin', 'hotel_admin', 'customer'
  hotel_id INT REFERENCES hotels(id) ON DELETE SET NULL, -- ለሆቴል አድሚን የትኛውን ሆቴል እንደሚያስተዳድር መለያ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROOMS TABLE (የሆቴል ክፍሎች - ከየሆቴላቸው ጋር የተሳሰሩ)
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  title VARCHAR(150) NOT NULL,
  room_type VARCHAR(50) NOT NULL, -- 'Standard', 'Deluxe', 'Suite', 'Presidential', 'Family'
  price_per_night NUMERIC(10, 2) NOT NULL,
  capacity INT NOT NULL,
  amenities TEXT[],
  image_url TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS TABLE (የክፍል ማስያዣዎች)
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  booking_reference VARCHAR(30) UNIQUE NOT NULL,
  room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
  hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'telebirr',
  payment_status VARCHAR(30) DEFAULT 'paid',
  status VARCHAR(30) DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
