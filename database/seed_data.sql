-- ============================================================================
-- ROYAL HOTEL — DEMONSTRATION SEED DATA
-- Purpose: Initial seed records for testing and demonstration
-- Note: All sample passwords are 'Password123!' hashed with BCrypt.
-- Hash: $2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS
-- ============================================================================

USE royal_hotel_db;

-- ----------------------------------------------------------------------------
-- 1. ROLES & PERMISSIONS
-- ----------------------------------------------------------------------------

INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_GUEST', 'Standard hotel guest'),
(2, 'ROLE_RECEPTIONIST', 'Front-desk operations, check-in, check-out'),
(3, 'ROLE_HOUSEKEEPING', 'Room turnover, cleaning and inspections'),
(4, 'ROLE_ROOM_SERVICE', 'Kitchen and food delivery staff'),
(5, 'ROLE_MAINTENANCE', 'Repairs and facility maintenance'),
(6, 'ROLE_CONCIERGE', 'Guest concierge and transportation'),
(7, 'ROLE_MANAGER', 'Operational supervisor and reporting'),
(8, 'ROLE_ACCOUNTS', 'Billing, payments, and financial auditing'),
(9, 'ROLE_ADMIN', 'System administration and configuration')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO permissions (id, name, description) VALUES
(1, 'BOOKING_CREATE', 'Create room reservations'),
(2, 'BOOKING_VIEW_OWN', 'View own reservations'),
(3, 'BOOKING_MANAGE_ALL', 'View and modify any reservation'),
(4, 'CHECK_IN_PERFORM', 'Check-in guests and allocate rooms'),
(5, 'CHECK_OUT_PERFORM', 'Check-out guests and verify bill settlement'),
(6, 'ROOM_CLEANING_UPDATE', 'Update room cleaning status'),
(7, 'ROOM_INSPECT_APPROVE', 'Approve room readiness'),
(8, 'SERVICE_REQUEST_MANAGE', 'Assign and complete guest requests'),
(9, 'BILLING_PAYMENT_COLLECT', 'Process simulated payments'),
(10, 'BILLING_REFUND_APPROVE', 'Approve and issue refunds'),
(11, 'SYSTEM_CONFIG_MANAGE', 'Manage hotel settings and staff accounts')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Map Admin to all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 9, id FROM permissions;

-- Map Receptionist permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 8);

-- Map Housekeeping permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(3, 6), (3, 7);

-- Map Accounts permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(8, 9), (8, 10);

-- Map Guest permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2);

-- ----------------------------------------------------------------------------
-- 2. DEMO USERS (Password for all accounts: Password123!)
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone_number, is_active) VALUES
(1, 'admin@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'System Administrator', '+1-555-0100', TRUE),
(2, 'reception@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Sarah Jenkins (Reception)', '+1-555-0101', TRUE),
(3, 'housekeeping@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Carlos Gomez (Housekeeping)', '+1-555-0102', TRUE),
(4, 'kitchen@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Chef Marcus (Room Service)', '+1-555-0103', TRUE),
(5, 'maintenance@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Dave Miller (Maintenance)', '+1-555-0104', TRUE),
(6, 'manager@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Eleanor Vance (General Manager)', '+1-555-0105', TRUE),
(7, 'accounts@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Robert Sterling (Accounts)', '+1-555-0106', TRUE),
(8, 'guest@royalhotel.com', '$2a$10$Hzb.98XQaHdOF91sDd3bHetZZ9ASytNu2x3Bcn9OcCh0Bb0aZRszS', 'Alexander Wright (Guest)', '+1-555-0199', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Assign user roles
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(1, 9), -- Admin
(2, 2), -- Receptionist
(3, 3), -- Housekeeping
(4, 4), -- Room Service
(5, 5), -- Maintenance
(6, 7), -- Manager
(7, 8), -- Accounts
(8, 1); -- Guest

-- Staff profiles
INSERT IGNORE INTO staff_profiles (user_id, employee_code, department, shift) VALUES
(1, 'EMP-ADM-01', 'Management', 'ALL'),
(2, 'EMP-REC-01', 'Front Office', 'MORNING'),
(3, 'EMP-HSK-01', 'Housekeeping', 'DAY'),
(4, 'EMP-KIT-01', 'Food & Beverage', 'EVENING'),
(5, 'EMP-MNT-01', 'Engineering', 'DAY'),
(6, 'EMP-MGR-01', 'Executive', 'DAY'),
(7, 'EMP-ACC-01', 'Finance', 'DAY');

-- Guest profile
INSERT IGNORE INTO guests (user_id, identification_type, identification_number, preferred_language, dietary_preferences, special_requests) VALUES
(8, 'PASSPORT', 'P89218291', 'en', 'Gluten-Free, Vegetarian', 'High floor room preferred');

-- ----------------------------------------------------------------------------
-- 3. HOTEL SETTINGS
-- ----------------------------------------------------------------------------

INSERT INTO hotel_settings (setting_key, setting_value, description) VALUES
('hotel_name', 'Royal Hotel & Grand Spa', 'Official property display title'),
('hotel_currency', 'INR', 'Primary billing currency code'),
('hotel_currency_symbol', '₹', 'Primary currency display symbol'),
('check_in_time', '15:00', 'Standard check-in time (24h)'),
('check_out_time', '11:00', 'Standard check-out time (24h)'),
('tax_rate_percentage', '10.00', 'Standard hospitality VAT/GST percentage'),
('cancellation_free_hours', '48', 'Hours prior to check-in eligible for free cancellation'),
('hotel_address', '100 Grand Boulevard, Royal City, RC 50401', 'Physical hotel location'),
('hotel_phone', '+1 (800) 555-ROYAL', 'Front desk contact number'),
('hotel_email', 'concierge@royalhotel.com', 'Primary inquiries email')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- ----------------------------------------------------------------------------
-- 4. ROOM CATEGORIES & INVENTORY
-- ----------------------------------------------------------------------------

INSERT INTO room_types (id, name, description, base_price_per_night, max_adults, max_children, bed_type, size_sqm, is_active, image_url) VALUES
(1, 'Deluxe King Room', 'Spacious and elegant room featuring a plush king-sized bed, marble ensuite bathroom, and panoramic city views.', 180.00, 2, 1, 'King Bed', 38, TRUE, '/images/rooms/deluxe_king.webp'),
(2, 'Executive Ocean Suite', 'Luxury suite featuring a private ocean-view balcony, dedicated executive work lounge, and deep soaking bathtub.', 320.00, 2, 2, 'King Bed + Sofa Bed', 62, TRUE, '/images/rooms/executive_suite.webp'),
(3, 'Royal Penthouse Suite', 'The pinnacle of luxury hospitality with private terrace, jacuzzi, master bedroom, and 24/7 dedicated butler service.', 650.00, 4, 2, '2 King Beds', 120, TRUE, '/images/rooms/royal_penthouse.webp'),
(4, 'Superior Twin Room', 'Comfortable accommodation fitted with two premium twin beds, ideal for friends or travelling colleagues.', 150.00, 2, 1, '2 Twin Beds', 32, TRUE, '/images/rooms/superior_twin.webp')
ON DUPLICATE KEY UPDATE base_price_per_night=VALUES(base_price_per_night);

INSERT INTO amenities (id, name, category, icon_name) VALUES
(1, 'Ultra High-Speed Wi-Fi', 'GENERAL', 'wifi'),
(2, 'King Size Bed', 'BEDROOM', 'bed'),
(3, 'Private Balcony', 'OUTDOOR', 'balcony'),
(4, 'Deep Soaking Bathtub', 'BATHROOM', 'bath'),
(5, 'Smart 4K Television', 'ENTERTAINMENT', 'tv'),
(6, 'Espresso Coffee Machine', 'BEVERAGE', 'coffee'),
(7, 'Mini Bar & Snacks', 'BEVERAGE', 'wine'),
(8, '24/7 Butler Service', 'SERVICE', 'concierge')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT IGNORE INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 5), (1, 6),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8),
(4, 1), (4, 5), (4, 6);

-- Physical rooms inventory
INSERT INTO rooms (id, room_type_id, room_number, floor_number, operational_status, occupancy_status, is_active) VALUES
-- Floor 1: Superior Twin Rooms
(1, 4, '101', 1, 'READY', 'VACANT', TRUE),
(2, 4, '102', 1, 'READY', 'VACANT', TRUE),
(3, 4, '103', 1, 'READY', 'VACANT', TRUE),
-- Floor 2: Deluxe King Rooms
(4, 1, '201', 2, 'READY', 'VACANT', TRUE),
(5, 1, '202', 2, 'READY', 'VACANT', TRUE),
(6, 1, '203', 2, 'READY', 'VACANT', TRUE),
(7, 1, '204', 2, 'READY', 'VACANT', TRUE),
-- Floor 3: Executive Ocean Suites
(8, 2, '301', 3, 'READY', 'VACANT', TRUE),
(9, 2, '302', 3, 'READY', 'VACANT', TRUE),
(10, 2, '303', 3, 'READY', 'VACANT', TRUE),
-- Floor 4: Royal Penthouse
(11, 3, '401', 4, 'READY', 'VACANT', TRUE),
(12, 3, '402', 4, 'READY', 'VACANT', TRUE)
ON DUPLICATE KEY UPDATE room_number=VALUES(room_number);

-- ----------------------------------------------------------------------------
-- 5. ROOM SERVICE MENU CATALOGUE
-- ----------------------------------------------------------------------------

INSERT INTO menu_items (id, name, category, description, price, is_vegetarian, is_available) VALUES
(1, 'Grand Continental Breakfast', 'BREAKFAST', 'Freshly baked artisanal croissants, seasonal fruits, eggs benedict, and freshly squeezed orange juice.', 24.00, FALSE, TRUE),
(2, 'Avocado Sourdough Toast', 'BREAKFAST', 'Toasted rustic sourdough with smashed Hass avocado, poached organic eggs, and microgreens.', 18.00, TRUE, TRUE),
(3, 'Wagyu Beef Burger', 'MAIN_COURSE', 'Char-grilled Australian Wagyu patty, aged cheddar, truffle aioli, and hand-cut sea-salt fries.', 28.00, FALSE, TRUE),
(4, 'Black Truffle Tagliatelle', 'MAIN_COURSE', 'Handmade fresh pasta tossed in Umbrian black truffle butter and 24-month aged Parmigiano Reggiano.', 32.00, TRUE, TRUE),
(5, 'Artisanal Margherita Pizza', 'MAIN_COURSE', 'San Marzano tomato sauce, fior di latte mozzarella, and fresh sweet basil.', 22.00, TRUE, TRUE),
(6, 'Valrhona Chocolate Fondant', 'DESSERT', 'Warm molten chocolate cake served with Madagascar vanilla bean gelato.', 14.00, TRUE, TRUE),
(7, 'Signature Royal Sunset Mocktail', 'BEVERAGE', 'Cold-pressed blood orange, passionfruit puree, sparkling tonic, and rosemary sprig.', 12.00, TRUE, TRUE),
(8, 'Double Shot Espresso', 'BEVERAGE', 'Rich single-origin Arabica roast espresso.', 6.00, TRUE, TRUE)
ON DUPLICATE KEY UPDATE price=VALUES(price);
