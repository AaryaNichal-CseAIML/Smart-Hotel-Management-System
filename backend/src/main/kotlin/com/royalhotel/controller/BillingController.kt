package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.service.BillingService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/billing")
class BillingController(
    private val billingService: BillingService
) {

    @GetMapping("/folios/{bookingId}")
    fun getFolioStatement(
        @PathVariable bookingId: Long,
        principal: Principal
    ): ResponseEntity<ApiResponse<FolioStatementDto>> {
        val statement = billingService.getFolioStatement(bookingId, principal.name)
        return ResponseEntity.ok(ApiResponse.success(statement, "Itemized stay folio statement retrieved."))
    }

    @PostMapping("/folios/{bookingId}/payments")
    fun processPayment(
        @PathVariable bookingId: Long,
        principal: Principal,
        @Valid @RequestBody request: SimulatedPaymentRequest
    ): ResponseEntity<ApiResponse<PaymentDto>> {
        val payment = billingService.processSimulatedPayment(bookingId, principal.name, request)
        return ResponseEntity.ok(ApiResponse.success(payment, "Simulated payment transaction executed (${payment.paymentStatus})."))
    }

    @PostMapping("/refunds")
    @PreAuthorize("hasAnyRole('ROLE_ACCOUNTS', 'ROLE_MANAGER', 'ROLE_ADMIN')")
    fun processRefund(
        principal: Principal,
        @Valid @RequestBody request: RefundRequest
    ): ResponseEntity<ApiResponse<RefundDto>> {
        val refund = billingService.processRefund(principal.name, request)
        return ResponseEntity.ok(ApiResponse.success(refund, "Refund transaction processed successfully."))
    }
}
