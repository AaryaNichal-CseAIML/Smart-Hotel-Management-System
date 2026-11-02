package com.royalhotel.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "bookings")
data class Booking(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "booking_reference", nullable = false, unique = true, length = 32)
    val bookingReference: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    val guest: Guest,

    @Column(name = "arrival_date", nullable = false)
    var arrivalDate: LocalDate,

    @Column(name = "departure_date", nullable = false)
    var departureDate: LocalDate,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: BookingStatus = BookingStatus.PENDING,

    @Column(name = "special_notes", columnDefinition = "TEXT")
    var specialNotes: String? = null,

    @OneToMany(mappedBy = "booking", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var bookingRooms: MutableList<BookingRoom> = mutableListOf(),

    @OneToOne(mappedBy = "booking", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var folio: GuestFolio? = null,

    @OneToMany(mappedBy = "booking", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var statusHistory: MutableList<BookingStatusHistory> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@Table(name = "booking_rooms")
data class BookingRoom(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    val booking: Booking,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    val roomType: RoomType,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_room_id")
    var assignedRoom: Room? = null,

    @Column(name = "adults_count", nullable = false)
    var adultsCount: Int = 1,

    @Column(name = "children_count", nullable = false)
    var childrenCount: Int = 0,

    @Column(name = "nightly_rate_snapshot", nullable = false, precision = 10, scale = 2)
    val nightlyRateSnapshot: BigDecimal,

    @Column(name = "total_room_charge", nullable = false, precision = 10, scale = 2)
    var totalRoomCharge: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status", nullable = false, length = 30)
    var itemStatus: BookingRoomStatus = BookingRoomStatus.CONFIRMED,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "booking_status_history")
data class BookingStatusHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    val booking: Booking,

    @Column(name = "previous_status", length = 30)
    val previousStatus: String? = null,

    @Column(name = "new_status", nullable = false, length = 30)
    val newStatus: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", nullable = false)
    val changedByUser: User,

    @Column(length = 255)
    val reason: String? = null,

    @Column(name = "changed_at", nullable = false, updatable = false)
    val changedAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "guest_folios")
data class GuestFolio(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    val booking: Booking,

    @Enumerated(EnumType.STRING)
    @Column(name = "folio_status", nullable = false, length = 20)
    var folioStatus: FolioStatus = FolioStatus.OPEN,

    @Column(name = "total_charges", nullable = false, precision = 10, scale = 2)
    var totalCharges: BigDecimal = BigDecimal.ZERO,

    @Column(name = "total_payments", nullable = false, precision = 10, scale = 2)
    var totalPayments: BigDecimal = BigDecimal.ZERO,

    @Column(name = "total_refunds", nullable = false, precision = 10, scale = 2)
    var totalRefunds: BigDecimal = BigDecimal.ZERO,

    @OneToMany(mappedBy = "folio", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var charges: MutableList<Charge> = mutableListOf(),

    @OneToMany(mappedBy = "folio", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var payments: MutableList<Payment> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun getOutstandingBalance(): BigDecimal {
        return totalCharges.subtract(totalPayments).add(totalRefunds)
    }

    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@Table(name = "charges")
data class Charge(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folio_id", nullable = false)
    val folio: GuestFolio,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_room_id")
    val bookingRoom: BookingRoom? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_category", nullable = false, length = 30)
    val chargeCategory: ChargeCategory,

    @Column(nullable = false, length = 255)
    val description: String,

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    val unitPrice: BigDecimal,

    @Column(nullable = false)
    val quantity: Int = 1,

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    val totalAmount: BigDecimal,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "payments")
data class Payment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folio_id", nullable = false)
    val folio: GuestFolio,

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 64)
    val transactionReference: String,

    @Column(nullable = false, precision = 10, scale = 2)
    val amount: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    val paymentMethod: PaymentMethod = PaymentMethod.SIMULATED_CARD,

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    var paymentStatus: PaymentStatus = PaymentStatus.PENDING,

    @Column(name = "processed_at", nullable = false)
    val processedAt: LocalDateTime = LocalDateTime.now(),

    @Column(length = 255)
    var notes: String? = null
)

@Entity
@Table(name = "refunds")
data class Refund(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    val payment: Payment,

    @Column(name = "refund_reference", nullable = false, unique = true, length = 64)
    val refundReference: String,

    @Column(nullable = false, precision = 10, scale = 2)
    val amount: BigDecimal,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: RefundStatus = RefundStatus.REQUESTED,

    @Column(nullable = false, length = 255)
    val reason: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    var approvedByUser: User? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
