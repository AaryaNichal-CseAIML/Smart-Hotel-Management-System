package com.royalhotel.repository

import com.royalhotel.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
}

@Repository
interface RoleRepository : JpaRepository<Role, Long> {
    fun findByName(name: String): Optional<Role>
}

@Repository
interface PermissionRepository : JpaRepository<Permission, Long> {
    fun findByName(name: String): Optional<Permission>
}

@Repository
interface GuestRepository : JpaRepository<Guest, Long> {
    fun findByUserId(userId: Long): Optional<Guest>
}

@Repository
interface StaffProfileRepository : JpaRepository<StaffProfile, Long> {
    fun findByUserId(userId: Long): Optional<StaffProfile>
    fun findByEmployeeCode(code: String): Optional<StaffProfile>
    fun findByDepartment(department: String): List<StaffProfile>
}

@Repository
interface HotelSettingRepository : JpaRepository<HotelSetting, Long> {
    fun findBySettingKey(settingKey: String): Optional<HotelSetting>
}

@Repository
interface RoomTypeRepository : JpaRepository<RoomType, Long> {
    fun findByName(name: String): Optional<RoomType>
    fun findByIsActiveTrue(): List<RoomType>
}

@Repository
interface AmenityRepository : JpaRepository<Amenity, Long>

@Repository
interface RoomRepository : JpaRepository<Room, Long> {
    fun findByRoomNumber(roomNumber: String): Optional<Room>
    fun findByRoomTypeId(roomTypeId: Long): List<Room>
    fun findByOperationalStatusAndOccupancyStatus(
        operationalStatus: OperationalStatus,
        occupancyStatus: OccupancyStatus
    ): List<Room>
    fun countByRoomTypeIdAndIsActiveTrue(roomTypeId: Long): Long
}

@Repository
interface BookingRepository : JpaRepository<Booking, Long> {
    fun findByBookingReference(bookingReference: String): Optional<Booking>
    fun findByGuestIdOrderByCreatedAtDesc(guestId: Long): List<Booking>
    fun findByStatus(status: BookingStatus): List<Booking>

    @Query("""
        SELECT b FROM Booking b 
        WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND b.arrivalDate < :departureDate 
        AND b.departureDate > :arrivalDate
    """)
    fun findActiveOverlappingBookings(
        @Param("arrivalDate") arrivalDate: LocalDate,
        @Param("departureDate") departureDate: LocalDate
    ): List<Booking>
}

@Repository
interface BookingRoomRepository : JpaRepository<BookingRoom, Long> {
    fun findByBookingId(bookingId: Long): List<BookingRoom>
    fun findByAssignedRoomId(assignedRoomId: Long): List<BookingRoom>
}

@Repository
interface BookingStatusHistoryRepository : JpaRepository<BookingStatusHistory, Long> {
    fun findByBookingIdOrderByChangedAtDesc(bookingId: Long): List<BookingStatusHistory>
}

@Repository
interface GuestFolioRepository : JpaRepository<GuestFolio, Long> {
    fun findByBookingId(bookingId: Long): Optional<GuestFolio>
}

@Repository
interface ChargeRepository : JpaRepository<Charge, Long> {
    fun findByFolioId(folioId: Long): List<Charge>
}

@Repository
interface PaymentRepository : JpaRepository<Payment, Long> {
    fun findByFolioId(folioId: Long): List<Payment>
    fun findByTransactionReference(transactionReference: String): Optional<Payment>
}

@Repository
interface RefundRepository : JpaRepository<Refund, Long> {
    fun findByPaymentId(paymentId: Long): List<Refund>
    fun findByRefundReference(refundReference: String): Optional<Refund>
}

@Repository
interface ServiceRequestRepository : JpaRepository<ServiceRequest, Long> {
    fun findByStatus(status: ServiceStatus): List<ServiceRequest>
    fun findByCategory(category: ServiceCategory): List<ServiceRequest>
    fun findByAssignedStaffId(assignedStaffId: Long): List<ServiceRequest>
}

@Repository
interface MenuItemRepository : JpaRepository<MenuItem, Long> {
    fun findByIsAvailableTrue(): List<MenuItem>
    fun findByCategoryAndIsAvailableTrue(category: MenuCategory): List<MenuItem>
}

@Repository
interface OrderRepository : JpaRepository<Order, Long> {
    fun findByOrderReference(orderReference: String): Optional<Order>
    fun findByStatus(status: OrderStatus): List<Order>
    fun findByBookingRoomId(bookingRoomId: Long): List<Order>
}

@Repository
interface MaintenanceTicketRepository : JpaRepository<MaintenanceTicket, Long> {
    fun findByStatus(status: TicketStatus): List<MaintenanceTicket>
    fun findByRoomId(roomId: Long): List<MaintenanceTicket>
    fun findByAssignedStaffId(assignedStaffId: Long): List<MaintenanceTicket>
}

@Repository
interface ReviewRepository : JpaRepository<Review, Long> {
    fun findByBookingId(bookingId: Long): Optional<Review>
    fun findAllByOrderByCreatedAtDesc(): List<Review>
}

@Repository
interface AuditLogRepository : JpaRepository<AuditLog, Long> {
    fun findByEntityNameAndEntityIdOrderByCreatedAtDesc(entityName: String, entityId: Long): List<AuditLog>
    fun findTop50ByOrderByCreatedAtDesc(): List<AuditLog>
}
