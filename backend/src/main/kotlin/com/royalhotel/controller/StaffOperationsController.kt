package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.entity.BookingStatus
import com.royalhotel.entity.OccupancyStatus
import com.royalhotel.entity.OperationalStatus
import com.royalhotel.service.StaffOperationsService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/staff")
class StaffOperationsController(
    private val staffOperationsService: StaffOperationsService
) {

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_HOUSEKEEPING', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_MAINTENANCE')")
    fun getRoomsInventory(
        @RequestParam(required = false) typeId: Long?,
        @RequestParam(required = false) operationalStatus: OperationalStatus?,
        @RequestParam(required = false) occupancyStatus: OccupancyStatus?
    ): ResponseEntity<ApiResponse<List<RoomInventoryDto>>> {
        val rooms = staffOperationsService.getRoomsInventory(typeId, operationalStatus, occupancyStatus)
        return ResponseEntity.ok(ApiResponse.success(rooms, "Room inventory retrieved."))
    }

    @PatchMapping("/rooms/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_MAINTENANCE')")
    fun updateRoomOperationalStatus(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateRoomStatusRequest
    ): ResponseEntity<ApiResponse<RoomInventoryDto>> {
        val updated = staffOperationsService.updateRoomOperationalStatus(id, request.operationalStatus)
        return ResponseEntity.ok(ApiResponse.success(updated, "Room ${updated.roomNumber} operational status changed to ${updated.operationalStatus}."))
    }

    @PostMapping("/bookings/{id}/check-in")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun checkIn(
        @PathVariable id: Long,
        principal: Principal,
        @Valid @RequestBody request: CheckInRequest
    ): ResponseEntity<ApiResponse<BookingDetailDto>> {
        val booking = staffOperationsService.performCheckIn(id, principal.name, request)
        return ResponseEntity.ok(ApiResponse.success(booking, "Reservation #${booking.bookingReference} checked in successfully."))
    }

    @PostMapping("/bookings/{id}/check-out")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun checkOut(
        @PathVariable id: Long,
        principal: Principal
    ): ResponseEntity<ApiResponse<BookingDetailDto>> {
        val booking = staffOperationsService.performCheckOut(id, principal.name)
        return ResponseEntity.ok(ApiResponse.success(booking, "Reservation #${booking.bookingReference} checked out; chambers transitioned to turnover cleaning."))
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun getAllStaffBookings(
        @RequestParam(required = false) status: BookingStatus?
    ): ResponseEntity<ApiResponse<List<BookingDetailDto>>> {
        val list = staffOperationsService.getAllStaffBookings(status)
        return ResponseEntity.ok(ApiResponse.success(list, "Staff operational reservations retrieved."))
    }

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_HOUSEKEEPING', 'ROLE_ROOM_SERVICE', 'ROLE_MAINTENANCE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun getDashboardSummary(): ResponseEntity<ApiResponse<StaffDashboardSummaryDto>> {
        val summary = staffOperationsService.getDashboardSummary()
        return ResponseEntity.ok(ApiResponse.success(summary, "Hotel operational KPI metrics retrieved."))
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ROLE_RECEPTIONIST', 'ROLE_HOUSEKEEPING', 'ROLE_ROOM_SERVICE', 'ROLE_MAINTENANCE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun getManagementAnalytics(): ResponseEntity<ApiResponse<ManagementAnalyticsDto>> {
        val analytics = staffOperationsService.getManagementAnalytics()
        return ResponseEntity.ok(ApiResponse.success(analytics, "Executive management analytics and audit trail retrieved."))
    }
}
