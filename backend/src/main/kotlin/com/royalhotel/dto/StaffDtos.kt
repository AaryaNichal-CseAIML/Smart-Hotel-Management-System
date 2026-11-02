package com.royalhotel.dto

import com.royalhotel.entity.OccupancyStatus
import com.royalhotel.entity.OperationalStatus
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull

data class RoomInventoryDto(
    val id: Long,
    val roomNumber: String,
    val floorNumber: Int,
    val roomTypeId: Long,
    val roomTypeName: String,
    val operationalStatus: OperationalStatus,
    val occupancyStatus: OccupancyStatus,
    val isActive: Boolean
)

data class RoomAllocationItem(
    @field:NotNull(message = "Booking room ID is required")
    val bookingRoomId: Long,

    @field:NotNull(message = "Physical room ID is required")
    val physicalRoomId: Long
)

data class CheckInRequest(
    @field:NotEmpty(message = "Room allocations must be specified for check-in")
    val allocations: List<RoomAllocationItem>
)

data class UpdateRoomStatusRequest(
    @field:NotNull(message = "Operational status is required")
    val operationalStatus: OperationalStatus
)

data class StaffDashboardSummaryDto(
    val totalRooms: Int,
    val occupiedRooms: Int,
    val vacantReadyRooms: Int,
    val cleaningRooms: Int,
    val maintenanceRooms: Int,
    val activeReservationsCount: Int,
    val todayArrivalsCount: Int,
    val todayDeparturesCount: Int,
    val pendingOrdersCount: Int,
    val pendingServiceRequestsCount: Int
)

data class AuditLogDto(
    val id: Long,
    val actionType: String,
    val entityName: String,
    val entityId: Long?,
    val oldValue: String?,
    val newValue: String?,
    val userEmail: String?,
    val createdAt: String
)

data class ManagementAnalyticsDto(
    val totalRevenue: java.math.BigDecimal,
    val roomRevenue: java.math.BigDecimal,
    val foodAndBeverageRevenue: java.math.BigDecimal,
    val servicesRevenue: java.math.BigDecimal,
    val totalBookings: Long,
    val completedStays: Long,
    val totalRooms: Int,
    val occupiedRooms: Int,
    val occupancyRatePercentage: Double,
    val averageDailyRate: java.math.BigDecimal,
    val revPar: java.math.BigDecimal,
    val recentAuditLogs: List<AuditLogDto>
)
