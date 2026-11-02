package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.service.BookingService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/bookings")
class BookingController(
    private val bookingService: BookingService
) {

    @PostMapping("/availability")
    fun checkAvailability(
        @Valid @RequestBody query: RoomAvailabilityQuery
    ): ResponseEntity<ApiResponse<List<RoomTypeAvailabilityDto>>> {
        val availability = bookingService.checkAvailability(query)
        return ResponseEntity.ok(ApiResponse.success(availability, "Chamber availability calculated successfully"))
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    fun createReservation(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: CreateBookingRequest
    ): ResponseEntity<ApiResponse<BookingDetailDto>> {
        val booking = bookingService.createReservation(userDetails.username, request)
        return ResponseEntity.ok(ApiResponse.success(booking, "Reservation #${booking.bookingReference} confirmed successfully"))
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    fun getMyBookings(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponse<List<BookingDetailDto>>> {
        val bookings = bookingService.getGuestBookings(userDetails.username)
        return ResponseEntity.ok(ApiResponse.success(bookings, "Guest booking history retrieved"))
    }

    @GetMapping("/{reference}")
    @PreAuthorize("isAuthenticated()")
    fun getBookingByReference(
        @PathVariable reference: String,
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponse<BookingDetailDto>> {
        val booking = bookingService.getBookingByReference(reference, userDetails.username)
        return ResponseEntity.ok(ApiResponse.success(booking, "Reservation details retrieved"))
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    fun cancelBooking(
        @PathVariable id: Long,
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestBody(required = false) request: CancelBookingRequest?
    ): ResponseEntity<ApiResponse<BookingDetailDto>> {
        val cancelReq = request ?: CancelBookingRequest()
        val updatedBooking = bookingService.cancelBooking(id, userDetails.username, cancelReq)
        return ResponseEntity.ok(ApiResponse.success(updatedBooking, "Reservation cancellation processed successfully"))
    }
}
