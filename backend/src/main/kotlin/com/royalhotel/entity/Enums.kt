package com.royalhotel.entity

enum class OperationalStatus {
    READY,
    CLEANING,
    MAINTENANCE
}

enum class OccupancyStatus {
    VACANT,
    OCCUPIED
}

enum class BookingStatus {
    PENDING,
    CONFIRMED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED
}

enum class BookingRoomStatus {
    CONFIRMED,
    CHECKED_IN,
    CHECKED_OUT,
    CANCELLED
}

enum class FolioStatus {
    OPEN,
    CLOSED
}

enum class ChargeCategory {
    ROOM,
    ROOM_SERVICE,
    FACILITY,
    TAX,
    DAMAGE,
    ADJUSTMENT
}

enum class PaymentMethod {
    SIMULATED_CARD,
    CASH,
    TRANSFER
}

enum class PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED
}

enum class RefundStatus {
    REQUESTED,
    APPROVED,
    COMPLETED,
    REJECTED
}

enum class ServiceCategory {
    HOUSEKEEPING,
    CONCIERGE,
    MAINTENANCE,
    FRONT_DESK
}

enum class ServicePriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

enum class ServiceStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

enum class MenuCategory {
    BREAKFAST,
    MAIN_COURSE,
    BEVERAGE,
    DESSERT,
    SNACKS
}

enum class OrderStatus {
    NEW,
    ACCEPTED,
    PREPARING,
    READY,
    DELIVERED,
    CANCELLED
}

enum class TicketSeverity {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

enum class TicketStatus {
    NEW,
    ASSIGNED,
    IN_PROGRESS,
    AWAITING_PARTS,
    RESOLVED,
    CLOSED
}
