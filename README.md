# 🏨 Grand Tana Luxury Hotel Booking System (የሆቴል ማስያዣ ሲስተም)
> **Full-Stack Web Application (React + Node.js + PostgreSQL)**  
> **Injibara University Academic Project**

---

## 📌 Project Overview
ይህ ሲስተም ለሆቴል ደንበኞች እና ለአስተዳዳሪዎች የተዘጋጀ ዘመናዊ፣ ፈጣን እና ሙሉ በሙሉ በ **React.js**፣ **Node.js/Express** እና **PostgreSQL** የተገነባ የሆቴል ክፍል ማስያዣ (Hotel Booking System) ነው።

---

## 🚀 ዋና ዋና ክፍሎች (Core Modules Implemented)

### 1. የተጠቃሚዎች ክፍል (Customer Portal)
* **ክፍሎችን መፈለግ እና ማጣራት (Search & Filter):**
  * በክፍል አይነት (Standard, Deluxe, Executive Suite, Presidential, Family Villa)
  * በዋጋ ወሰን (Price Range in ETB)
  * በእንግዶች ብዛት (Guests Capacity)
  * በስም ወይም በአገልግሎቶች (WiFi, Jacuzzi, Balcony...)
* **ክፍል መምረጥ እና ማስያዝ (Booking & Reservation):**
  * የመግቢያ (Check-in) እና የመውጫ (Check-out) ቀን መምረጫ
  * የቀናትን ብዛት እና ጠቅላላ ክፍያ (Total ETB) በራሱ ያሰላል
  * ክፍሉ በዚያ ሰዓት አስቀድሞ መያዝ አለመያዙን በራስ-ሰር ያረጋግጣል (Collision Prevention)
* **የክፍያ አማራጮች (Payment Methods):**
  * 📱 **Telebirr (ቴሌብር)**
  * 🏦 **CBE Birr (ንግድ ባንክ)**
  * 💵 **በሆቴሉ በግንባር መክፈል (Cash at Hotel)**
* **የእኔ ማስያዣዎች (My Bookings):**
  * ያስያዟቸውን ክፍሎች ማየት
  * ማስያዣን መሰረዝ (Cancel Booking)

### 2. የአስተዳዳሪ ክፍል (Admin Dashboard)
* **የቀጥታ ስታቲስቲክስ (Live Analytics):**
  * ጠቅላላ ክፍሎች (Total Rooms)
  * ንቁ ማስያዣዎች (Active Bookings)
  * የክፍል ተይዞ የመገኘት ምጣኔ (Occupancy Rate %)
  * ጠቅላላ ገቢ (Total Revenue in ETB)
* **አዳዲስ ክፍሎችን መጨመር (Add New Rooms):**
  * የክፍል ቁጥር፣ ስም፣ አይነት፣ ዋጋ፣ ምስል እና መግለጫ መመዝገብ
* **ማስያዣዎችን መቆጣጠር (Bookings Management):**
  * የሁሉንም ደንበኞች ማስያዣዎች ማየትና መሰረዝ

---

## 🛠️ ቴክኖሎጂዎች (Tech Stack)
* **Frontend:** React 19, Vite, Lucide Icons, Responsive CSS
* **Backend:** Node.js, Express.js, CORS, RESTful API
* **Database:** PostgreSQL (Database: `hotel_booking_db`)

---

## 🏃‍♂️ እንዴት ማስነሳት ይቻላል? (How to Run)

### አማራጭ ፩፦ በ 1-Click (በጣም ፈጣኑ መንገድ)
1. ዴስክቶፕዎ ላይ ያለውን **"Hotel Booking System"** የሚለውን አቋራጭ Double-Click ያድርጉት።
2. በራሱ ጊዜ ሰርቨሮቹን አስነስቶ ብሮውዘርዎን ይከፍትልዎታል።

### አማራጭ ፪፦ በተርሚናል
```powershell
# 1. ባክኢንድ ማስነሳት (Port 5050)
cd "C:\Users\Mr. X\Desktop\ada\hotel_booking_system"
node server.js

# 2. ፍሮንትኢንድ ማስነሳት (Port 3300)
cd "C:\Users\Mr. X\Desktop\ada\hotel_booking_system\client"
npm run dev -- --port 3300
```

* **Frontend UI:** `http://localhost:3300`
* **Backend API:** `http://localhost:5050/api/rooms`
* **Admin Login:** `admin@hotel.com` / `admin123`
