package com.royalhotel.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "service_requests")
data class ServiceRequest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_room_id", nullable = false)
    val bookingRoom: BookingRoom,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var category: ServiceCategory,

    @Column(nullable = false, length = 150)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var description: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var priority: ServicePriority = ServicePriority.MEDIUM,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: ServiceStatus = ServiceStatus.NEW,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    var assignedStaff: User? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@Table(name = "menu_items")
data class MenuItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 150)
    var name: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var category: MenuCategory,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(nullable = false, precision = 10, scale = 2)
    var price: BigDecimal,

    @Column(name = "is_vegetarian", nullable = false)
    var isVegetarian: Boolean = false,

    @Column(name = "is_available", nullable = false)
    var isAvailable: Boolean = true,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "orders")
data class Order(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "order_reference", nullable = false, unique = true, length = 32)
    val orderReference: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_room_id", nullable = false)
    val bookingRoom: BookingRoom,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: OrderStatus = OrderStatus.NEW,

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    var specialInstructions: String? = null,

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    var totalAmount: BigDecimal,

    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var items: MutableList<OrderItem> = mutableListOf(),

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
@Table(name = "order_items")
data class OrderItem(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    val order: Order,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "menu_item_id", nullable = false)
    val menuItem: MenuItem,

    @Column(nullable = false)
    var quantity: Int = 1,

    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    val unitPriceSnapshot: BigDecimal,

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    var totalPrice: BigDecimal
)

@Entity
@Table(name = "maintenance_tickets")
data class MaintenanceTicket(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    val room: Room,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_user_id", nullable = false)
    val reportedByUser: User,

    @Column(nullable = false, length = 50)
    var category: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var description: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var severity: TicketSeverity = TicketSeverity.MEDIUM,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: TicketStatus = TicketStatus.NEW,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    var assignedStaff: User? = null,

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    var resolutionNotes: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "resolved_at")
    var resolvedAt: LocalDateTime? = null
)

@Entity
@Table(name = "reviews")
data class Review(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    val booking: Booking,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    val guest: Guest,

    @Column(name = "overall_rating", nullable = false)
    var overallRating: Int,

    @Column(name = "cleanliness_rating", nullable = false)
    var cleanlinessRating: Int,

    @Column(name = "service_rating", nullable = false)
    var serviceRating: Int,

    @Column(columnDefinition = "TEXT")
    var comment: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "audit_logs")
data class AuditLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User? = null,

    @Column(name = "action_type", nullable = false, length = 100)
    val actionType: String,

    @Column(name = "entity_name", nullable = false, length = 100)
    val entityName: String,

    @Column(name = "entity_id")
    val entityId: Long? = null,

    @Column(name = "old_value", columnDefinition = "JSON")
    val oldValue: String? = null,

    @Column(name = "new_value", columnDefinition = "JSON")
    val newValue: String? = null,

    @Column(name = "ip_address", length = 45)
    val ipAddress: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
