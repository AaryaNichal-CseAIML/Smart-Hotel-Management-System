package com.royalhotel.dto

import com.royalhotel.entity.*
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class ChargeDto(
    val id: Long,
    val chargeCategory: ChargeCategory,
    val description: String,
    val unitPrice: BigDecimal,
    val quantity: Int,
    val totalAmount: BigDecimal,
    val createdAt: String
)

data class PaymentDto(
    val id: Long,
    val transactionReference: String,
    val amount: BigDecimal,
    val paymentMethod: PaymentMethod,
    val paymentStatus: PaymentStatus,
    val processedAt: String,
    val notes: String?
)

data class RefundDto(
    val id: Long,
    val paymentId: Long,
    val refundReference: String,
    val amount: BigDecimal,
    val status: RefundStatus,
    val reason: String,
    val approvedByName: String?,
    val createdAt: String
)

data class FolioStatementDto(
    val folioId: Long,
    val bookingId: Long,
    val bookingReference: String,
    val guestName: String,
    val guestEmail: String,
    val folioStatus: FolioStatus,
    val totalCharges: BigDecimal,
    val totalPayments: BigDecimal,
    val totalRefunds: BigDecimal,
    val outstandingBalance: BigDecimal,
    val charges: List<ChargeDto>,
    val payments: List<PaymentDto>,
    val refunds: List<RefundDto>
)

data class SimulatedPaymentRequest(
    @field:NotNull(message = "Payment amount is required")
    @field:DecimalMin(value = "1.00", message = "Payment amount must be at least 1.00")
    val amount: BigDecimal,

    val paymentMethod: PaymentMethod = PaymentMethod.SIMULATED_CARD,
    val cardHolderName: String? = null,
    val cardLastFour: String? = "4242",
    val simulateOutcome: String = "SUCCESS", // "SUCCESS" | "FAILED" | "PENDING"
    val failureReason: String? = null
)

data class RefundRequest(
    @field:NotNull(message = "Payment ID is required")
    val paymentId: Long,

    @field:NotNull(message = "Refund amount is required")
    @field:DecimalMin(value = "1.00", message = "Refund amount must be at least 1.00")
    val amount: BigDecimal,

    @field:NotBlank(message = "Refund reason is required")
    val reason: String
)
