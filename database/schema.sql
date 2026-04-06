-- ============================================================
-- Real Estate Full-Stack Project — MySQL Database Schema
-- Run this entire file in MySQL Workbench or phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS realestate_db;
USE realestate_db;

-- ── 1. Users Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- hashed with bcrypt
  role        ENUM('admin','agent','buyer') NOT NULL DEFAULT 'buyer',
  full_name   VARCHAR(100),
  phone       VARCHAR(20),
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Listings Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  type          ENUM('House','Apartment','Condo','Villa','Land','Commercial','Townhouse') NOT NULL DEFAULT 'Apartment',
  listing_for   ENUM('sale','rent') NOT NULL DEFAULT 'sale',
  price         DECIMAL(15,2) NOT NULL,
  location      VARCHAR(255) NOT NULL,
  address       VARCHAR(500),
  bedrooms      INT DEFAULT 0,
  bathrooms     INT DEFAULT 0,
  area          DECIMAL(10,2) DEFAULT 0,
  floor         INT DEFAULT NULL,
  parking       TINYINT(1) DEFAULT 0,
  furnished     TINYINT(1) DEFAULT 0,
  image_url     VARCHAR(500),
  status        ENUM('available','sold','rented') NOT NULL DEFAULT 'available',
  agent_id      INT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ── 3. Favourites Table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS favourites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  listing_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fav (user_id, listing_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ── 4. Contact Messages Table ────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  listing_id  INT NOT NULL,
  sender_name VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL,
  phone       VARCHAR(20),
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- ── 5. Seed Demo Users ───────────────────────────────────────
-- Passwords are bcrypt hashed. Plain text passwords:
-- admin   → admin123
-- agent1  → agent123
-- agent2  → agent123
-- buyer1  → buyer123
INSERT INTO users (username, email, password, role, full_name, phone) VALUES
('admin',  'admin@estatehub.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'admin', 'Admin User',    '000-000-0000'),
('agent1', 'agent1@estatehub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'agent', 'Somchai Agent', '081-234-5678'),
('agent2', 'agent2@estatehub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'agent', 'Malee Agent',   '082-345-6789'),
('buyer1', 'buyer1@estatehub.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'buyer', 'John Buyer',    '083-456-7890');

-- ── 6. Seed Sample Listings ──────────────────────────────────
INSERT INTO listings (title, description, type, listing_for, price, location, address, bedrooms, bathrooms, area, parking, furnished, image_url, status, agent_id) VALUES
('Modern 3BR House in Sukhumvit',       'Beautiful modern house with garden and pool. Perfect for families.', 'House',     'sale', 8500000,  'Bangkok',   '123 Sukhumvit Rd, Bangkok',     3, 2, 180, 1, 1, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', 'available', 2),
('Cozy 1BR Apartment near BTS',         'Convenient location, fully furnished, great city views.',            'Apartment', 'rent',   18000,   'Bangkok',   '45 Asok, Sukhumvit 21, Bangkok', 1, 1,  45, 0, 1, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'available', 2),
('Luxury Villa with Pool in Phuket',    'Stunning sea view villa, 4 bedrooms, private infinity pool.',        'Villa',     'sale', 25000000,  'Phuket',    '88 Patong Hill, Phuket',         4, 4, 450, 2, 1, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 'available', 3),
('Studio Apartment in Chiang Mai',      'Perfect for singles or couples. Walking distance to Nimman.',        'Apartment', 'rent',    8000,   'Chiang Mai', '12 Nimman Rd, Chiang Mai',       0, 1,  30, 0, 1, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'available', 3),
('2BR Condo with City View',            'High floor unit with panoramic city views. Ready to move in.',       'Condo',     'sale',  4200000,  'Bangkok',   '200 Sathorn, Bangkok',           2, 2,  85, 1, 0, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'available', 2),
('Commercial Space in CBD',             'Prime location retail space, 200sqm, ground floor, high footfall.',  'Commercial','sale', 12000000,  'Bangkok',   '55 Silom Rd, Bangkok',           0, 2, 200, 2, 0, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 'available', 2),
('Townhouse in Pattaya',                '3-storey townhouse, modern design, near beach.',                     'Townhouse', 'sale',  3500000,  'Pattaya',   '77 Jomtien Beach Rd, Pattaya',  3, 3, 150, 1, 0, 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800', 'available', 3),
('Land Plot in Khao Yai',              '2 rai land plot, great for resort development. Mountain views.',      'Land',      'sale',  5000000,  'Nakhon Ratchasima', 'Khao Yai, Nakhon Ratchasima', 0, 0, 3200, 0, 0, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 'available', 3);
