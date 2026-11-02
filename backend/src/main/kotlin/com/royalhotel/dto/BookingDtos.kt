package com.royalhotel.dto

import com.royalhotel.entity.BookingRoomStatus
import com.royalhotel.entity.BookingStatus
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.FutureOrPresent
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class RoomAvailabilityQuery(
    @field:NotNull(message = "Arrival date is required")
    val arrivalDate: LocalDate,

    @field:NotNull(message = "Departure date is required")
    val departureDate: LocalDate,

    val adults: Int = 1,
    val children: Int = 0,
    val roomCount: Int = 1
)

data class RoomTypeAvailabilityDto(
    val roomTypeId: Long,
    val name: String,
    val description: String,
    val imageUrl: String?,
    val bedType: String,
    val maxAdults: Int,
    val maxChildren: Int,
    val sizeSqm: Int?,
    val amenities: List<String>,
    val availableInventory: Int,
    val isAvailable: Boolean,
    val totalNights: Int,
    val nightlyRate: BigDecimal,
    val totalRoomCharge: BigDecimal,
    val estimatedTaxAmount: BigDecimal,
    val totalEstimatedPrice: BigDecimal
)

data class BookingRoomRequestItem(
    @field:NotNull(message = "Room Type ID is required")
    val roomTypeId: Long,

    val adultsCount: Int = 1,
    val childrenCount: Int = 0,
    val guestName: String? = null
)

data class CreateBookingRequest(
    @field:NotNull(message = "Arrival date is required")
    val arrivalDate: LocalDate,

    @field:NotNull(message = "Departure date is required")
    val departureDate: LocalDate,

    @field:NotEmpty(message = "At least one room must be selected")
    val rooms: List<BookingRoomRequestItem>,

    val specialNotes: String? = null
)

data class BookingRoomDto(
    val id: Long,
    val roomTypeId: Long,
    val roomTypeName: String,
    val assignedRoomNumber: String?,
    val adultsCount: Int,
    val childrenCount: Int,
    val nightlyRateSnapshot: BigDecimal,
    val totalRoomCharge: BigDecimal,
    val itemStatus: BookingRoomStatus
)

data class BookingDetailDto(
    val id: Long,
    val bookingReference: String,
    val guestName: String,
    val guestEmail: String,
    val arrivalDate: LocalDate,
    val departureDate: LocalDate,
    val totalNights: Int,
    val status: BookingStatus,
    val specialNotes: String?,
    val rooms: List<BookingRoomDto>,
    val subtotalCharges: BigDecimal,
    val taxAmount: BigDecimal,
    val totalAmount: BigDecimal,
    val folioId: Long?,
    val outstandingBalance: BigDecimal,
    val createdAt: LocalDateTime
)

data class CancelBookingRequest(
    val reason: String? = "Guest requested cancellation",
    val cancelEntireBooking: Boolean = true,
    val bookingRoomId: Long? = null
)
