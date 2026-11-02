package com.royalhotel.service

import com.royalhotel.dto.*
import com.royalhotel.entity.*
import com.royalhotel.exception.BusinessException
import com.royalhotel.exception.ResourceNotFoundException
import com.royalhotel.exception.UnauthorizedException
import com.royalhotel.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

@Service
class BillingService(
    private val guestFolioRepository: GuestFolioRepository,
    private val bookingRepository: BookingRepository,
    private val chargeRepository: ChargeRepository,
    private val paymentRepository: PaymentRepository,
    private val refundRepository: RefundRepository,
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getFolioStatement(bookingId: Long, userEmail: String): FolioStatementDto {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { ResourceNotFoundException("Reservation #$bookingId not found.") }

        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to view folio records for reservation #${booking.bookingReference}.")
        }

        val folio = guestFolioRepository.findByBookingId(booking.id)
            .orElseThrow { ResourceNotFoundException("Folio statement for reservation #${booking.bookingReference} not found.") }

        val charges = chargeRepository.findByFolioId(folio.id).sortedBy { it.createdAt }
        val payments = paymentRepository.findByFolioId(folio.id).sortedBy { it.processedAt }
        val refunds = payments.flatMap { p -> refundRepository.findByPaymentId(p.id) }.sortedBy { it.createdAt }

        return FolioStatementDto(
            folioId = folio.id,
            bookingId = booking.id,
            bookingReference = booking.bookingReference,
            guestName = booking.guest.user.fullName,
            guestEmail = booking.guest.user.email,
            folioStatus = folio.folioStatus,
            totalCharges = folio.totalCharges,
            totalPayments = folio.totalPayments,
            totalRefunds = folio.totalRefunds,
            outstandingBalance = folio.getOutstandingBalance(),
            charges = charges.map { c ->
                ChargeDto(
                    id = c.id,
                    chargeCategory = c.chargeCategory,
                    description = c.description,
                    unitPrice = c.unitPrice,
                    quantity = c.quantity,
                    totalAmount = c.totalAmount,
                    createdAt = c.createdAt.toString()
                )
            },
            payments = payments.map { p ->
                PaymentDto(
                    id = p.id,
                    transactionReference = p.transactionReference,
                    amount = p.amount,
                    paymentMethod = p.paymentMethod,
                    paymentStatus = p.paymentStatus,
                    processedAt = p.processedAt.toString(),
                    notes = p.notes
                )
            },
            refunds = refunds.map { r ->
                RefundDto(
                    id = r.id,
                    paymentId = r.payment.id,
                    refundReference = r.refundReference,
                    amount = r.amount,
                    status = r.status,
                    reason = r.reason,
                    approvedByName = r.approvedByUser?.fullName,
                    createdAt = r.createdAt.toString()
                )
            }
        )
    }

    @Transactional
    fun processSimulatedPayment(
        bookingId: Long,
        userEmail: String,
        request: SimulatedPaymentRequest
    ): PaymentDto {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { ResourceNotFoundException("Reservation #$bookingId not found.") }

        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to process payments for reservation #${booking.bookingReference}.")
        }

        val folio = guestFolioRepository.findByBookingId(booking.id)
            .orElseThrow { ResourceNotFoundException("Folio for reservation #${booking.bookingReference} not found.") }

        val txRef = "PAY-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" +
                UUID.randomUUID().toString().substring(0, 4).uppercase()

        val paymentStatus = when (request.simulateOutcome.uppercase()) {
            "FAILED" -> PaymentStatus.FAILED
            "PENDING" -> PaymentStatus.PENDING
            else -> PaymentStatus.SUCCESS
        }

        val note = when (paymentStatus) {
            PaymentStatus.FAILED -> request.failureReason ?: "Simulated card authorization decline (Insufficient Funds or Card Blocked)."
            PaymentStatus.PENDING -> "Authorization pending cardholder 3D-Secure bank verification."
            PaymentStatus.SUCCESS -> "Simulated card ending in ${request.cardLastFour ?: "4242"} successfully debited."
        }

        val payment = Payment(
            folio = folio,
            transactionReference = txRef,
            amount = request.amount,
            paymentMethod = request.paymentMethod,
            paymentStatus = paymentStatus,
            notes = note
        )

        val savedPayment = paymentRepository.save(payment)

        if (paymentStatus == PaymentStatus.SUCCESS) {
            folio.totalPayments = folio.totalPayments.add(request.amount)
            // If balance cleared and booking is checked out, close folio
            if (folio.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0 && booking.status == BookingStatus.CHECKED_OUT) {
                folio.folioStatus = FolioStatus.CLOSED
            }
            guestFolioRepository.save(folio)
        }

        return PaymentDto(
            id = savedPayment.id,
            transactionReference = savedPayment.transactionReference,
            amount = savedPayment.amount,
            paymentMethod = savedPayment.paymentMethod,
            paymentStatus = savedPayment.paymentStatus,
            processedAt = savedPayment.processedAt.toString(),
            notes = savedPayment.notes
        )
    }

    @Transactional
    fun processRefund(userEmail: String, request: RefundRequest): RefundDto {
        val staffUser = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val isStaff = staffUser.roles.any { it.name != "ROLE_GUEST" }
        if (!isStaff) {
            throw UnauthorizedException("Only hotel management or accounts staff can approve and process refunds.")
        }

        val payment = paymentRepository.findById(request.paymentId)
            .orElseThrow { ResourceNotFoundException("Payment #${request.paymentId} not found.") }

        if (payment.paymentStatus != PaymentStatus.SUCCESS) {
            throw BusinessException("Refunds can only be issued against successful payments.")
        }

        if (request.amount > payment.amount) {
            throw BusinessException("Refund amount ($${request.amount}) cannot exceed original payment ($${payment.amount}).")
        }

        val refundRef = "REF-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" +
                UUID.randomUUID().toString().substring(0, 4).uppercase()

        val refund = Refund(
            payment = payment,
            refundReference = refundRef,
            amount = request.amount,
            status = RefundStatus.COMPLETED,
            reason = request.reason.trim(),
            approvedByUser = staffUser
        )

        val savedRefund = refundRepository.save(refund)

        val folio = payment.folio
        folio.totalRefunds = folio.totalRefunds.add(request.amount)
        guestFolioRepository.save(folio)

        return RefundDto(
            id = savedRefund.id,
            paymentId = payment.id,
            refundReference = savedRefund.refundReference,
            amount = savedRefund.amount,
            status = savedRefund.status,
            reason = savedRefund.reason,
            approvedByName = staffUser.fullName,
            createdAt = savedRefund.createdAt.toString()
        )
    }
}
