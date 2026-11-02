package com.royalhotel.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "hotel_settings")
data class HotelSetting(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    val settingKey: String,

    @Column(name = "setting_value", nullable = false, columnDefinition = "TEXT")
    var settingValue: String,

    @Column(length = 255)
    var description: String? = null,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@Table(name = "room_types")
data class RoomType(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    var name: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var description: String,

    @Column(name = "base_price_per_night", nullable = false, precision = 10, scale = 2)
    var basePricePerNight: BigDecimal,

    @Column(name = "max_adults", nullable = false)
    var maxAdults: Int = 2,

    @Column(name = "max_children", nullable = false)
    var maxChildren: Int = 1,

    @Column(name = "bed_type", nullable = false, length = 50)
    var bedType: String,

    @Column(name = "size_sqm")
    var sizeSqm: Int? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @Column(name = "image_url", length = 500)
    var imageUrl: String? = null,

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "room_type_amenities",
        joinColumns = [JoinColumn(name = "room_type_id")],
        inverseJoinColumns = [JoinColumn(name = "amenity_id")]
    )
    var amenities: MutableSet<Amenity> = mutableSetOf(),

    @OneToMany(mappedBy = "roomType", fetch = FetchType.LAZY)
    var rooms: MutableList<Room> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "amenities")
data class Amenity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    var name: String,

    @Column(nullable = false, length = 50)
    var category: String,

    @Column(name = "icon_name", length = 50)
    var iconName: String? = null
)

@Entity
@Table(name = "rooms")
data class Room(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    var roomType: RoomType,

    @Column(name = "room_number", nullable = false, unique = true, length = 20)
    var roomNumber: String,

    @Column(name = "floor_number", nullable = false)
    var floorNumber: Int,

    @Enumerated(EnumType.STRING)
    @Column(name = "operational_status", nullable = false, length = 20)
    var operationalStatus: OperationalStatus = OperationalStatus.READY,

    @Enumerated(EnumType.STRING)
    @Column(name = "occupancy_status", nullable = false, length = 20)
    var occupancyStatus: OccupancyStatus = OccupancyStatus.VACANT,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

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
