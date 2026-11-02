package com.royalhotel.dto

import com.royalhotel.entity.*
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class MenuItemDto(
    val id: Long,
    val name: String,
    val category: MenuCategory,
    val description: String?,
    val price: BigDecimal,
    val isVegetarian: Boolean,
    val isAvailable: Boolean
)

data class OrderItemRequest(
    @field:NotNull(message = "Menu item ID is required")
    val menuItemId: Long,

    @field:Min(value = 1, message = "Quantity must be at least 1")
    val quantity: Int
)

data class CreateOrderRequest(
    @field:NotNull(message = "Booking room ID is required")
    val bookingRoomId: Long,

    val specialInstructions: String? = null,

    @field:NotEmpty(message = "Order must contain at least one item")
    val items: List<OrderItemRequest>
)

data class OrderItemDto(
    val id: Long,
    val menuItemId: Long,
    val menuItemName: String,
    val quantity: Int,
    val unitPriceSnapshot: BigDecimal,
    val totalPrice: BigDecimal
)

data class OrderDto(
    val id: Long,
    val orderReference: String,
    val bookingReference: String,
    val bookingRoomId: Long,
    val roomNumber: String?,
    val roomTypeName: String,
    val status: OrderStatus,
    val specialInstructions: String?,
    val totalAmount: BigDecimal,
    val items: List<OrderItemDto>,
    val createdAt: String,
    val updatedAt: String
)

data class UpdateOrderStatusRequest(
    @field:NotNull(message = "Order status is required")
    val status: OrderStatus
)

data class CreateServiceRequest(
    @field:NotNull(message = "Booking room ID is required")
    val bookingRoomId: Long,

    @field:NotNull(message = "Service category is required")
    val category: ServiceCategory,

    @field:NotBlank(message = "Service request title is required")
    val title: String,

    @field:NotBlank(message = "Service request description is required")
    val description: String,

    val priority: ServicePriority = ServicePriority.MEDIUM
)

data class ServiceRequestDto(
    val id: Long,
    val bookingReference: String,
    val bookingRoomId: Long,
    val roomNumber: String?,
    val roomTypeName: String,
    val category: ServiceCategory,
    val title: String,
    val description: String,
    val priority: ServicePriority,
    val status: ServiceStatus,
    val assignedStaffName: String?,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String?
)

data class UpdateServiceRequestStatus(
    @field:NotNull(message = "Status is required")
    val status: ServiceStatus,
    val assignedStaffId: Long? = null
)

data class CreateMaintenanceTicketRequest(
    @field:NotNull(message = "Room ID is required")
    val roomId: Long,

    @field:NotBlank(message = "Category is required")
    val category: String,

    @field:NotBlank(message = "Description is required")
    val description: String,

    val severity: TicketSeverity = TicketSeverity.MEDIUM
)

data class MaintenanceTicketDto(
    val id: Long,
    val roomId: Long,
    val roomNumber: String,
    val reportedByName: String,
    val category: String,
    val description: String,
    val severity: TicketSeverity,
    val status: TicketStatus,
    val assignedStaffName: String?,
    val resolutionNotes: String?,
    val createdAt: String,
    val resolvedAt: String?
)

data class UpdateMaintenanceTicketRequest(
    @field:NotNull(message = "Status is required")
    val status: TicketStatus,
    val assignedStaffId: Long? = null,
    val resolutionNotes: String? = null
)
