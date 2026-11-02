package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.entity.TicketStatus
import com.royalhotel.service.MaintenanceService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/maintenance")
class MaintenanceController(
    private val maintenanceService: MaintenanceService
) {

    @PostMapping("/tickets")
    fun createTicket(
        principal: Principal,
        @Valid @RequestBody request: CreateMaintenanceTicketRequest
    ): ResponseEntity<ApiResponse<MaintenanceTicketDto>> {
        val created = maintenanceService.createTicket(principal.name, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Maintenance ticket logged successfully."))
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('ROLE_MAINTENANCE', 'ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_RECEPTIONIST')")
    fun getAllTickets(
        @RequestParam(required = false) status: TicketStatus?
    ): ResponseEntity<ApiResponse<List<MaintenanceTicketDto>>> {
        val list = maintenanceService.getAllTickets(status)
        return ResponseEntity.ok(ApiResponse.success(list, "Maintenance tickets retrieved."))
    }

    @PatchMapping("/tickets/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MAINTENANCE', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun updateTicket(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateMaintenanceTicketRequest
    ): ResponseEntity<ApiResponse<MaintenanceTicketDto>> {
        val updated = maintenanceService.updateTicket(id, request)
        return ResponseEntity.ok(ApiResponse.success(updated, "Maintenance ticket #$id updated."))
    }
}
