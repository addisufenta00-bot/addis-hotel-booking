// Reseed script for Addis Ababa premier hotels
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hotel_booking_db',
  password: process.env.DB_PASSWORD || '121619',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function reseedAddis() {
  try {
    console.log('🔄 Cleaning and reseeding Addis Ababa Premier Hotels...');

    // Delete existing records cleanly
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM rooms');
    await pool.query('DELETE FROM users');
    await pool.query('DELETE FROM hotels');

    // Reset sequences
    await pool.query('ALTER SEQUENCE hotels_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE rooms_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1');

    // 1. Insert 4 Luxury Hotels in Addis Ababa
    const hotelsRes = await pool.query(`
      INSERT INTO hotels (name, city, address, star_rating, phone, email, image_url, description) VALUES
      (
        'Ethiopian Skylight Hotel',
        'Addis Ababa',
        'Bole International Airport Area, Bole Sub-City, Addis Ababa',
        5.0,
        '+251 116 818 181',
        'reservations@skylightaddis.com',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'Ethiopias grand 5-star airport luxury gateway featuring world-class dining, VIP airport transit lounge, and Olympic-size swimming pool.'
      ),
      (
        'Sheraton Addis, Luxury Collection',
        'Addis Ababa',
        'Taitu Street, Menelik II Avenue, Kirkos Sub-City, Addis Ababa',
        5.0,
        '+251 115 171 717',
        'reservations.sheratonaddis@luxurycollection.com',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'Sanctuary of refined Ethiopian luxury and diplomatic prestige, featuring heated underwater-music pools, opulent private villas, and royal gardens.'
      ),
      (
        'Hyatt Regency Addis Ababa',
        'Addis Ababa',
        'Meskel Square, Central Business District, Addis Ababa',
        4.9,
        '+251 115 171 234',
        'addis.regency@hyatt.com',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        'Modern architectural gem centrally located at historic Meskel Square, overlooking the memorial and light rail, featuring open-kitchen dining.'
      ),
      (
        'Radisson Blu Hotel Addis Ababa',
        'Addis Ababa',
        'Kazanchis Business District, Kirkos Sub-City, Addis Ababa',
        4.8,
        '+251 115 157 600',
        'info.addisababa@radissonblu.com',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'Contemporary diplomatic haven in Kazanchis adjacent to UNECA, offering supreme business amenities, signature French bakery, and luxury spa.'
      )
      RETURNING id, name;
    `);

    const skylightId = hotelsRes.rows[0].id;
    const sheratonId = hotelsRes.rows[1].id;
    const hyattId = hotelsRes.rows[2].id;
    const radissonId = hotelsRes.rows[3].id;

    // 2. Insert Super Admin and Individual Hotel Admins
    await pool.query(`
      INSERT INTO users (name, email, password, phone, role, hotel_id) VALUES
      -- 👑 Super Admin (Controls ALL hotels in Addis Ababa)
      ('Addis Platform Super Admin', 'superadmin@platform.com', 'super123', '+251 911 000 000', 'super_admin', NULL),

      -- 🏨 Hotel Admin 1 (Manages Skylight Hotel only)
      ('Skylight Executive Manager', 'admin.skylight@hotel.com', 'skylight123', '+251 911 111 222', 'hotel_admin', ${skylightId}),

      -- 🏨 Hotel Admin 2 (Manages Sheraton Addis only)
      ('Sheraton General Manager', 'admin.sheraton@hotel.com', 'sheraton123', '+251 922 222 333', 'hotel_admin', ${sheratonId}),

      -- 🏨 Hotel Admin 3 (Manages Hyatt Regency only)
      ('Hyatt Regency Manager', 'admin.hyatt@hotel.com', 'hyatt123', '+251 933 333 444', 'hotel_admin', ${hyattId}),

      -- 🏨 Hotel Admin 4 (Manages Radisson Blu only)
      ('Radisson Blu Manager', 'admin.radisson@hotel.com', 'radisson123', '+251 944 444 555', 'hotel_admin', ${radissonId}),

      -- 👤 Demo Customer
      ('Yonas Tadesse', 'yonas@gmail.com', 'user123', '+251 955 555 666', 'customer', NULL);
    `);

    // 3. Insert Rooms (2 per hotel = 8 rooms total)
    await pool.query(`
      INSERT INTO rooms (hotel_id, room_number, title, room_type, price_per_night, capacity, amenities, image_url, description) VALUES
      -- Ethiopian Skylight Hotel (Bole, Addis Ababa)
      (${skylightId}, '301', 'Skylight Presidential Penthouse Suite', 'Presidential', 12500.00, 4, 
       ARRAY['Private Jacuzzi', 'Butler Service', 'Airport VIP Lounge Access', 'Bole Skyline View', 'Champagne Bar'], 
       'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
       'Palatial penthouse on the top floor overlooking the Bole Addis Ababa skyline with private elevator access.'),

      (${skylightId}, '302', 'Skylight Business Executive Deluxe', 'Suite', 6800.00, 2, 
       ARRAY['High-speed Fiber WiFi', 'Ergonomic Desk', 'Luxury Rain Shower', 'Free Buffet Breakfast'], 
       'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
       'World-class soundproofed luxury suite situated just 5 minutes from Bole International Airport.'),

      -- Sheraton Addis (Kirkos / Menelik II Ave, Addis Ababa)
      (${sheratonId}, '201', 'Sheraton Royal Diplomatic Villa', 'Suite', 14000.00, 4, 
       ARRAY['Private Villa Garden', 'Heated Pool Access', 'Limousine Transfer', '24h Private Butler', 'Sauna'], 
       'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
       'Exclusive diplomatic villa surrounded by lush botanical gardens, offering presidential-grade security and unmatched luxury.'),

      (${sheratonId}, '202', 'Sheraton Classic Deluxe Garden View', 'Deluxe', 7200.00, 2, 
       ARRAY['Garden View Balcony', 'Marble Bathroom', 'King Bed', 'Complimentary Breakfast', 'High-speed WiFi'], 
       'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
       'Serene garden-facing deluxe room featuring classical European architecture and modern Ethiopian hospitality.'),

      -- Hyatt Regency (Meskel Square, Addis Ababa)
      (${hyattId}, '401', 'Hyatt Regency Meskel Square Suite', 'Suite', 8900.00, 3, 
       ARRAY['Meskel Square View', 'Club Lounge Access', 'Kitchenette', 'Espresso Machine', 'Smart TV'], 
       'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
       'Spacious modern suite commanding breathtaking views of historic Meskel Square and the Addis Ababa Light Rail.'),

      (${hyattId}, '402', 'Hyatt Regency Premium King Room', 'Deluxe', 5600.00, 2, 
       ARRAY['City Skyline View', 'Rain Shower', 'Work Desk', 'Free High-speed WiFi', '24h Room Service'], 
       'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
       'Crisp contemporary room with floor-to-ceiling windows overlooking central Addis Ababa with upscale amenities.'),

      -- Radisson Blu Hotel (Kazanchis, Addis Ababa)
      (${radissonId}, '501', 'Radisson Kazanchis Diplomatic Suite', 'Suite', 7500.00, 2, 
       ARRAY['UNECA View', 'Executive Lounge Access', 'Meeting Area', 'Complimentary Breakfast', 'Mini-bar'], 
       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
       'Diplomatic suite located in Kazanchis adjacent to the UN Conference Center, built specifically for diplomats and global executives.'),

      (${radissonId}, '502', 'Radisson Executive Business Room', 'Deluxe', 5100.00, 2, 
       ARRAY['High-speed WiFi', 'Workstation', 'City View', 'Buffet Breakfast', 'Fitness Center Access'], 
       'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
       'Comfortable executive room with premier business connectivity and French cafe room service in the heart of Kazanchis.');
    `);

    // 4. Insert Bookings (3 active bookings)
    const roomRows = await pool.query('SELECT id, hotel_id, room_number, price_per_night FROM rooms ORDER BY id');

    // Skylight Room 301
    await pool.query(`
      INSERT INTO bookings (booking_reference, room_id, hotel_id, customer_name, customer_email, customer_phone, check_in, check_out, guests_count, total_price, payment_method, payment_status, status)
      VALUES ('BK-SKY301', ${roomRows.rows[0].id}, ${roomRows.rows[0].hotel_id}, 'Dawit Bekele', 'dawit@example.com', '+251 933 777 999', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 2, 25000.00, 'telebirr', 'paid', 'confirmed');
    `);

    // Sheraton Room 201
    await pool.query(`
      INSERT INTO bookings (booking_reference, room_id, hotel_id, customer_name, customer_email, customer_phone, check_in, check_out, guests_count, total_price, payment_method, payment_status, status)
      VALUES ('BK-SHER201', ${roomRows.rows[2].id}, ${roomRows.rows[2].hotel_id}, 'Yonas Tadesse', 'yonas@gmail.com', '+251 922 333 444', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days', 2, 42000.00, 'cbe', 'paid', 'confirmed');
    `);

    // Hyatt Room 401
    await pool.query(`
      INSERT INTO bookings (booking_reference, room_id, hotel_id, customer_name, customer_email, customer_phone, check_in, check_out, guests_count, total_price, payment_method, payment_status, status)
      VALUES ('BK-HYATT401', ${roomRows.rows[4].id}, ${roomRows.rows[4].hotel_id}, 'Almaz Abebe', 'almaz@example.com', '+251 911 555 777', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 2, 26700.00, 'telebirr', 'paid', 'confirmed');
    `);

    console.log('✅ Successfully seeded Addis Ababa Premier Hotels, Users, Rooms, and Bookings!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Reseed Error:', err);
    process.exit(1);
  }
}

reseedAddis();
