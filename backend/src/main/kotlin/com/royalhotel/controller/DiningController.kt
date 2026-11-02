package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.entity.MenuCategory
import com.royalhotel.entity.OrderStatus
import com.royalhotel.service.DiningAndRoomService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api")
class DiningController(
    private val diningAndRoomService: DiningAndRoomService
) {

    @GetMapping("/dining/menu")
    fun getMenu(@RequestParam(required = false) category: MenuCategory?): ResponseEntity<ApiResponse<List<MenuItemDto>>> {
        val menu = diningAndRoomService.getMenu(category)
        return ResponseEntity.ok(ApiResponse.success(menu, "Menu catalogue retrieved successfully."))
    }

    @PostMapping("/orders")
    fun createOrder(
        principal: Principal,
        @Valid @RequestBody request: CreateOrderRequest
    ): ResponseEntity<ApiResponse<OrderDto>> {
        val order = diningAndRoomService.createOrder(principal.name, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(order, "Room service order placed and folio updated successfully."))
    }

    @GetMapping("/orders/my")
    fun getMyOrders(principal: Principal): ResponseEntity<ApiResponse<List<OrderDto>>> {
        val orders = diningAndRoomService.getMyOrders(principal.name)
        return ResponseEntity.ok(ApiResponse.success(orders, "Your stay dining orders retrieved."))
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ROLE_ROOM_SERVICE', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_RECEPTIONIST')")
    fun getAllOrders(
        @RequestParam(required = false) status: OrderStatus?
    ): ResponseEntity<ApiResponse<List<OrderDto>>> {
        val orders = diningAndRoomService.getAllOrders(status)
        return ResponseEntity.ok(ApiResponse.success(orders, "Room service kitchen queue retrieved."))
    }

    @PatchMapping("/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ROLE_ROOM_SERVICE', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_RECEPTIONIST')")
    fun updateOrderStatus(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateOrderStatusRequest
    ): ResponseEntity<ApiResponse<OrderDto>> {
        val updated = diningAndRoomService.updateOrderStatus(id, request.status)
        return ResponseEntity.ok(ApiResponse.success(updated, "Order #${updated.orderReference} status updated to ${updated.status}."))
    }
}
