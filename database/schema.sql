-- ============================================================================
-- ROYAL HOTEL — DATABASE SCHEMA DEFINITION
-- Database Engine: MySQL 8.0+
-- Database Name: royal_hotel_db
-- Character Set: UTF8MB4 (Full Unicode)
-- Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS royal_hotel_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE royal_hotel_db;

-- ----------------------------------------------------------------------------
-- MODULE 1: IDENTITY & ROLE-BASED ACCESS CONTROL (RBAC)
-- ----------------------------------------------------------------------------

-- Table 1: users (Central identity table for guests and employees)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- Table 2: roles (System roles: GUEST, RECEPTIONIST, HOUSEKEEPING, etc.)
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Table 3: permissions (Granular action capabilities)
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB;

-- Table 4: role_permissions (Mapping roles to permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 5: user_roles (Assigning roles to user accounts)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 6: guests (Guest profile attributes & stay preferences)
CREATE TABLE IF NOT EXISTS guests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    identification_type VARCHAR(50) NULL,
    identification_number VARCHAR(100) NULL,
    preferred_language VARCHAR(20) DEFAULT 'en',
    dietary_preferences TEXT NULL,
    special_requests TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_guests_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 7: staff_profiles (Staff organizational data)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    shift VARCHAR(30) NOT NULL DEFAULT 'DAY',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- MODULE 2: HOTEL & ROOM INVENTORY
-- ----------------------------------------------------------------------------

-- Table 8: hotel_settings (Configurable operational settings and policies)
CREATE TABLE IF NOT EXISTS hotel_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 9: room_types (Room categories and rate definitions)
CREATE TABLE IF NOT EXISTS room_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_price_per_night DECIMAL(10,2) NOT NULL,
    max_adults INT NOT NULL DEFAULT 2,
    max_children INT NOT NULL DEFAULT 1,
    bed_type VARCHAR(50) NOT NULL,
    size_sqm INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 10: amenities (Master list of amenities)
CREATE TABLE IF NOT EXISTS amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    icon_name VARCHAR(50) NULL
) ENGINE=InnoDB;

-- Table 11: room_type_amenities (Mapping amenities to room types)
CREATE TABLE IF NOT EXISTS room_type_amenities (
    room_type_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (room_type_id, amenity_id),
    CONSTRAINT fk_rta_room_type FOREIGN KEY (room_type_id) REFERENCES room_types (id) ON DELETE CASCADE,
    CONSTRAINT fk_rta_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 12: rooms (Physical individual room units)
CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_type_id BIGINT NOT NULL,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor_number INT NOT NULL,
    operational_status ENUM('READY', 'CLEANING', 'MAINTENANCE') NOT NULL DEFAULT 'READY',
    occupancy_status ENUM('VACANT', 'OCCUPIED') NOT NULL DEFAULT 'VACANT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rooms_type FOREIGN KEY (room_type_id) REFERENCES room_types (id) ON DELETE RESTRICT,
    INDEX idx_rooms_status (operational_status, occupancy_status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- MODULE 3: MULTI-ROOM RESERVATION SYSTEM
-- ----------------------------------------------------------------------------

-- Table 13: bookings (Master reservation parent record)
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    guest_id BIGINT NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    special_notes TEXT NULL,
    total_nights INT GENERATED ALWAYS AS (DATEDIFF(departure_date, arrival_date)) VIRTUAL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_guest FOREIGN KEY (guest_id) REFERENCES guests (id) ON DELETE RESTRICT,
    INDEX idx_bookings_dates (arrival_date, departure_date),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB;

-- Table 14: booking_rooms (Individual rooms reserved within a booking)
CREATE TABLE IF NOT EXISTS booking_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    room_type_id BIGINT NOT NULL,
    assigned_room_id BIGINT NULL,
    adults_count INT NOT NULL DEFAULT 1,
    children_count INT NOT NULL DEFAULT 0,
    nightly_rate_snapshot DECIMAL(10,2) NOT NULL,
    total_room_charge DECIMAL(10,2) NOT NULL,
    item_status ENUM('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_br_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_br_room_type FOREIGN KEY (room_type_id) REFERENCES room_types (id) ON DELETE RESTRICT,
    CONSTRAINT fk_br_room FOREIGN KEY (assigned_room_id) REFERENCES rooms (id) ON DELETE SET NULL,
    INDEX idx_br_assigned_room (assigned_room_id)
) ENGINE=InnoDB;

-- Table 15: booking_status_history (Audit log of booking transitions)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    previous_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by_user_id BIGINT NOT NULL,
    reason VARCHAR(255) NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_bsh_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- MODULE 4: FINANCIAL LEDGER, CHARGES & PAYMENTS
-- ----------------------------------------------------------------------------

-- Table 16: guest_folios (Central financial billing folio per booking)
CREATE TABLE IF NOT EXISTS guest_folios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    folio_status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    total_charges DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_payments DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_refunds DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    outstanding_balance DECIMAL(10,2) GENERATED ALWAYS AS (total_charges - total_payments + total_refunds) STORED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_folios_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 17: charges (Itemized charges: room, dining, tax, adjustments)
CREATE TABLE IF NOT EXISTS charges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    folio_id BIGINT NOT NULL,
    booking_room_id BIGINT NULL,
    charge_category ENUM('ROOM', 'ROOM_SERVICE', 'FACILITY', 'TAX', 'DAMAGE', 'ADJUSTMENT') NOT NULL,
    description VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_charges_folio FOREIGN KEY (folio_id) REFERENCES guest_folios (id) ON DELETE CASCADE,
    CONSTRAINT fk_charges_br FOREIGN KEY (booking_room_id) REFERENCES booking_rooms (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 18: payments (Simulated payment attempts and records)
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    folio_id BIGINT NOT NULL,
    transaction_reference VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('SIMULATED_CARD', 'CASH', 'TRANSFER') NOT NULL DEFAULT 'SIMULATED_CARD',
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255) NULL,
    CONSTRAINT fk_payments_folio FOREIGN KEY (folio_id) REFERENCES guest_folios (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 19: refunds (Tracked simulated refunds)
CREATE TABLE IF NOT EXISTS refunds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    refund_reference VARCHAR(64) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('REQUESTED', 'APPROVED', 'COMPLETED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    reason VARCHAR(255) NOT NULL,
    approved_by_user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_approver FOREIGN KEY (approved_by_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- MODULE 5: IN-STAY OPERATIONS & SERVICE REQUESTS
-- ----------------------------------------------------------------------------

-- Table 20: service_requests (Housekeeping, Concierge, Front Desk tasks)
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_room_id BIGINT NOT NULL,
    category ENUM('HOUSEKEEPING', 'CONCIERGE', 'MAINTENANCE', 'FRONT_DESK') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    assigned_staff_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_sr_br FOREIGN KEY (booking_room_id) REFERENCES booking_rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_sr_staff FOREIGN KEY (assigned_staff_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 21: menu_items (Food & Beverage catalogue for room service)
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('BREAKFAST', 'MAIN_COURSE', 'BEVERAGE', 'DESSERT', 'SNACKS') NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 22: orders (Room service orders)
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_reference VARCHAR(32) NOT NULL UNIQUE,
    booking_room_id BIGINT NOT NULL,
    status ENUM('NEW', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
    special_instructions TEXT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_br FOREIGN KEY (booking_room_id) REFERENCES booking_rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 23: order_items (Ordered food items and quantities)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_snapshot DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 24: maintenance_tickets (Facility & room maintenance issues)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id BIGINT NOT NULL,
    reported_by_user_id BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('NEW', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_PARTS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    assigned_staff_id BIGINT NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_mt_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_mt_reporter FOREIGN KEY (reported_by_user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_mt_assignee FOREIGN KEY (assigned_staff_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- MODULE 6: REVIEWS & AUDIT TRAILS
-- ----------------------------------------------------------------------------

-- Table 25: reviews (Post-stay guest ratings and reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    guest_id BIGINT NOT NULL,
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    cleanliness_rating INT NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
    service_rating INT NOT NULL CHECK (service_rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_guest FOREIGN KEY (guest_id) REFERENCES guests (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 26: audit_logs (System-wide audit trail for sensitive administrative operations)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_entity (entity_name, entity_id),
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;
