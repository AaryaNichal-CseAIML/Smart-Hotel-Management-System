package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.entity.ServiceCategory
import com.royalhotel.entity.ServiceStatus
import com.royalhotel.service.GuestRequestService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/service-requests")
class ServiceRequestController(
    private val guestRequestService: GuestRequestService
) {

    @PostMapping
    fun createServiceRequest(
        principal: Principal,
        @Valid @RequestBody request: CreateServiceRequest
    ): ResponseEntity<ApiResponse<ServiceRequestDto>> {
        val created = guestRequestService.createServiceRequest(principal.name, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(created, "Guest service request dispatched to hospitality team."))
    }

    @GetMapping("/my")
    fun getMyServiceRequests(principal: Principal): ResponseEntity<ApiResponse<List<ServiceRequestDto>>> {
        val requests = guestRequestService.getMyServiceRequests(principal.name)
        return ResponseEntity.ok(ApiResponse.success(requests, "Guest service requests retrieved."))
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_CONCIERGE', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun getAllServiceRequests(
        @RequestParam(required = false) status: ServiceStatus?,
        @RequestParam(required = false) category: ServiceCategory?
    ): ResponseEntity<ApiResponse<List<ServiceRequestDto>>> {
        val list = guestRequestService.getAllServiceRequests(status, category)
        return ResponseEntity.ok(ApiResponse.success(list, "Staff operational service requests retrieved."))
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_HOUSEKEEPING', 'ROLE_CONCIERGE', 'ROLE_RECEPTIONIST', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun updateServiceRequest(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateServiceRequestStatus
    ): ResponseEntity<ApiResponse<ServiceRequestDto>> {
        val updated = guestRequestService.updateServiceRequestStatus(id, request)
        return ResponseEntity.ok(ApiResponse.success(updated, "Service request #$id status updated."))
    }
}
