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
import java.math.RoundingMode
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.UUID

@Service
class BookingService(
    private val bookingRepository: BookingRepository,
    private val bookingRoomRepository: BookingRoomRepository,
    private val bookingStatusHistoryRepository: BookingStatusHistoryRepository,
    private val roomTypeRepository: RoomTypeRepository,
    private val roomRepository: RoomRepository,
    private val guestRepository: GuestRepository,
    private val userRepository: UserRepository,
    private val hotelSettingRepository: HotelSettingRepository,
    private val guestFolioRepository: GuestFolioRepository,
    private val chargeRepository: ChargeRepository
) {

    @Transactional(readOnly = true)
    fun checkAvailability(query: RoomAvailabilityQuery): List<RoomTypeAvailabilityDto> {
        validateDateRange(query.arrivalDate, query.departureDate)

        val totalNights = ChronoUnit.DAYS.between(query.arrivalDate, query.departureDate).toInt()
        val taxRate = getTaxRatePercentage()
        val activeRoomTypes = roomTypeRepository.findByIsActiveTrue()
        val overlappingBookings = bookingRepository.findActiveOverlappingBookings(query.arrivalDate, query.departureDate)

        // Count active booked rooms per room type during this date window
        val bookedRoomsCountByType = mutableMapOf<Long, Int>()
        overlappingBookings.forEach { booking ->
            booking.bookingRooms.forEach { br ->
                if (br.itemStatus == BookingRoomStatus.CONFIRMED || br.itemStatus == BookingRoomStatus.CHECKED_IN) {
                    val currentCount = bookedRoomsCountByType.getOrDefault(br.roomType.id, 0)
                    bookedRoomsCountByType[br.roomType.id] = currentCount + 1
                }
            }
        }

        return activeRoomTypes.map { rt ->
            val totalRoomsInType = roomRepository.countByRoomTypeIdAndIsActiveTrue(rt.id).toInt()
            val bookedCount = bookedRoomsCountByType.getOrDefault(rt.id, 0)
            val availableCount = (totalRoomsInType - bookedCount).coerceAtLeast(0)
            val isAvailable = availableCount >= query.roomCount

            val nightlyRate = rt.basePricePerNight
            val totalRoomCharge = nightlyRate.multiply(BigDecimal(totalNights * query.roomCount))
            val estimatedTaxAmount = totalRoomCharge.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            val totalEstimatedPrice = totalRoomCharge.add(estimatedTaxAmount)

            RoomTypeAvailabilityDto(
                roomTypeId = rt.id,
                name = rt.name,
                description = rt.description,
                imageUrl = rt.imageUrl,
                bedType = rt.bedType,
                maxAdults = rt.maxAdults,
                maxChildren = rt.maxChildren,
                sizeSqm = rt.sizeSqm,
                amenities = rt.amenities.map { it.name },
                availableInventory = availableCount,
                isAvailable = isAvailable,
                totalNights = totalNights,
                nightlyRate = nightlyRate,
                totalRoomCharge = totalRoomCharge,
                estimatedTaxAmount = estimatedTaxAmount,
                totalEstimatedPrice = totalEstimatedPrice
            )
        }
    }

    @Transactional
    fun createReservation(userEmail: String, request: CreateBookingRequest): BookingDetailDto {
        validateDateRange(request.arrivalDate, request.departureDate)
        if (request.rooms.isEmpty()) {
            throw BusinessException("At least one room must be selected for the reservation.")
        }

        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        // Ensure user has guest profile
        val guest = guestRepository.findByUserId(user.id).orElseGet {
            guestRepository.save(Guest(user = user))
        }

        val totalNights = ChronoUnit.DAYS.between(request.arrivalDate, request.departureDate).toInt()
        val taxRate = getTaxRatePercentage()

        // 1. Concurrency & Availability Validation
        val overlappingBookings = bookingRepository.findActiveOverlappingBookings(request.arrivalDate, request.departureDate)
        val bookedRoomsCountByType = mutableMapOf<Long, Int>()
        overlappingBookings.forEach { booking ->
            booking.bookingRooms.forEach { br ->
                if (br.itemStatus == BookingRoomStatus.CONFIRMED || br.itemStatus == BookingRoomStatus.CHECKED_IN) {
                    val count = bookedRoomsCountByType.getOrDefault(br.roomType.id, 0)
                    bookedRoomsCountByType[br.roomType.id] = count + 1
                }
            }
        }

        // Group requested rooms by type
        val requestedCountByType = request.rooms.groupingBy { it.roomTypeId }.eachCount()
        requestedCountByType.forEach { (typeId, requestedCount) ->
            val roomType = roomTypeRepository.findById(typeId)
                .orElseThrow { ResourceNotFoundException("Room Type with ID $typeId does not exist.") }
            val totalRoomsInType = roomRepository.countByRoomTypeIdAndIsActiveTrue(typeId).toInt()
            val alreadyBooked = bookedRoomsCountByType.getOrDefault(typeId, 0)
            val available = totalRoomsInType - alreadyBooked

            if (requestedCount > available) {
                throw BusinessException(
                    "Insufficient room inventory for category '${roomType.name}'. Only $available room(s) available for selected dates, but $requestedCount requested."
                )
            }
        }

        // 2. Generate Unique Booking Reference
        val datePrefix = request.arrivalDate.format(DateTimeFormatter.BASIC_ISO_DATE)
        val randomSuffix = UUID.randomUUID().toString().substring(0, 4).uppercase()
        val bookingRef = "RH-$datePrefix-$randomSuffix"

        // 3. Create Master Booking Entity
        val booking = Booking(
            bookingReference = bookingRef,
            guest = guest,
            arrivalDate = request.arrivalDate,
            departureDate = request.departureDate,
            status = BookingStatus.CONFIRMED,
            specialNotes = request.specialNotes
        )
        val savedBooking = bookingRepository.save(booking)

        // 4. Create Booking Rooms & calculate subtotal
        var subtotalCharges = BigDecimal.ZERO
        val createdBookingRooms = mutableListOf<BookingRoom>()

        request.rooms.forEach { item ->
            val roomType = roomTypeRepository.findById(item.roomTypeId)
                .orElseThrow { ResourceNotFoundException("Room type ID ${item.roomTypeId} not found") }

            val nightlyRate = roomType.basePricePerNight
            val roomTotal = nightlyRate.multiply(BigDecimal(totalNights))
            subtotalCharges = subtotalCharges.add(roomTotal)

            val bookingRoom = BookingRoom(
                booking = savedBooking,
                roomType = roomType,
                adultsCount = item.adultsCount,
                childrenCount = item.childrenCount,
                nightlyRateSnapshot = nightlyRate,
                totalRoomCharge = roomTotal,
                itemStatus = BookingRoomStatus.CONFIRMED
            )
            createdBookingRooms.add(bookingRoomRepository.save(bookingRoom))
        }

        // 5. Initialize Guest Folio & Ledger Charges
        val taxAmount = subtotalCharges.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        val totalGrandAmount = subtotalCharges.add(taxAmount)

        val folio = GuestFolio(
            booking = savedBooking,
            folioStatus = FolioStatus.OPEN,
            totalCharges = totalGrandAmount,
            totalPayments = BigDecimal.ZERO,
            totalRefunds = BigDecimal.ZERO
        )
        val savedFolio = guestFolioRepository.save(folio)

        // Line-item charges
        createdBookingRooms.forEach { br ->
            val roomCharge = Charge(
                folio = savedFolio,
                bookingRoom = br,
                chargeCategory = ChargeCategory.ROOM,
                description = "${br.roomType.name} (${totalNights} nights @ $${br.nightlyRateSnapshot}/night)",
                unitPrice = br.nightlyRateSnapshot,
                quantity = totalNights,
                totalAmount = br.totalRoomCharge
            )
            chargeRepository.save(roomCharge)
        }

        val taxCharge = Charge(
            folio = savedFolio,
            chargeCategory = ChargeCategory.TAX,
            description = "Hospitality Tax / VAT (${taxRate}%)",
            unitPrice = taxAmount,
            quantity = 1,
            totalAmount = taxAmount
        )
        chargeRepository.save(taxCharge)

        // 6. Record Initial Status History
        val history = BookingStatusHistory(
            booking = savedBooking,
            previousStatus = null,
            newStatus = "CONFIRMED",
            changedByUser = user,
            reason = "Initial reservation confirmed for ${createdBookingRooms.size} room(s)"
        )
        bookingStatusHistoryRepository.save(history)

        return mapToDetailDto(savedBooking, createdBookingRooms, savedFolio, subtotalCharges, taxAmount, totalGrandAmount)
    }

    @Transactional(readOnly = true)
    fun getGuestBookings(userEmail: String): List<BookingDetailDto> {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }
        val guest = guestRepository.findByUserId(user.id).orElse(null)
            ?: return emptyList()

        val bookings = bookingRepository.findByGuestIdOrderByCreatedAtDesc(guest.id)
        return bookings.map { b ->
            val rooms = bookingRoomRepository.findByBookingId(b.id)
            val folio = guestFolioRepository.findByBookingId(b.id).orElse(null)
            val subtotal = rooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
                .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
            val taxRate = getTaxRatePercentage()
            val tax = subtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            val total = subtotal.add(tax)
            mapToDetailDto(b, rooms, folio, subtotal, tax, total)
        }
    }

    @Transactional(readOnly = true)
    fun getBookingByReference(reference: String, userEmail: String): BookingDetailDto {
        val booking = bookingRepository.findByBookingReference(reference)
            .orElseThrow { ResourceNotFoundException("Reservation with reference '$reference' not found.") }

        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        // IDOR protection: only the guest or authorized staff can access
        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to view reservation '$reference'.")
        }

        val rooms = bookingRoomRepository.findByBookingId(booking.id)
        val folio = guestFolioRepository.findByBookingId(booking.id).orElse(null)
        val subtotal = rooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
            .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
        val taxRate = getTaxRatePercentage()
        val tax = subtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        val total = subtotal.add(tax)

        return mapToDetailDto(booking, rooms, folio, subtotal, tax, total)
    }

    @Transactional
    fun cancelBooking(bookingId: Long, userEmail: String, request: CancelBookingRequest): BookingDetailDto {
        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { ResourceNotFoundException("Reservation with ID $bookingId not found.") }

        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to cancel reservation #${booking.bookingReference}.")
        }

        if (booking.status == BookingStatus.CHECKED_OUT || booking.status == BookingStatus.CANCELLED) {
            throw BusinessException("Reservation is already ${booking.status} and cannot be modified.")
        }

        val rooms = bookingRoomRepository.findByBookingId(booking.id)
        val folio = guestFolioRepository.findByBookingId(booking.id).orElse(null)

        if (request.cancelEntireBooking || request.bookingRoomId == null) {
            // Cancel entire booking
            booking.status = BookingStatus.CANCELLED
            rooms.forEach { it.itemStatus = BookingRoomStatus.CANCELLED }

            // Recalculate folio
            if (folio != null) {
                val previousTotal = folio.totalCharges
                folio.totalCharges = BigDecimal.ZERO
                // Record adjustment charge
                chargeRepository.save(
                    Charge(
                        folio = folio,
                        chargeCategory = ChargeCategory.ADJUSTMENT,
                        description = "Cancellation adjustment: Full refund of room charges",
                        unitPrice = previousTotal.negate(),
                        quantity = 1,
                        totalAmount = previousTotal.negate()
                    )
                )
            }

            bookingStatusHistoryRepository.save(
                BookingStatusHistory(
                    booking = booking,
                    previousStatus = "CONFIRMED",
                    newStatus = "CANCELLED",
                    changedByUser = user,
                    reason = request.reason ?: "Guest cancelled entire reservation"
                )
            )
        } else {
            // Cancel individual room item
            val targetRoom = rooms.find { it.id == request.bookingRoomId }
                ?: throw ResourceNotFoundException("Room item ID ${request.bookingRoomId} not found in this booking.")

            targetRoom.itemStatus = BookingRoomStatus.CANCELLED

            // If all rooms cancelled, mark whole booking cancelled
            val activeRemaining = rooms.any { it.itemStatus != BookingRoomStatus.CANCELLED }
            if (!activeRemaining) {
                booking.status = BookingStatus.CANCELLED
            }

            // Adjust folio charges
            if (folio != null) {
                val taxRate = getTaxRatePercentage()
                val roomCharge = targetRoom.totalRoomCharge
                val roomTax = roomCharge.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
                val totalDeduction = roomCharge.add(roomTax)

                folio.totalCharges = (folio.totalCharges - totalDeduction).coerceAtLeast(BigDecimal.ZERO)

                chargeRepository.save(
                    Charge(
                        folio = folio,
                        bookingRoom = targetRoom,
                        chargeCategory = ChargeCategory.ADJUSTMENT,
                        description = "Cancelled room item #${targetRoom.id} (${targetRoom.roomType.name})",
                        unitPrice = totalDeduction.negate(),
                        quantity = 1,
                        totalAmount = totalDeduction.negate()
                    )
                )
            }

            bookingStatusHistoryRepository.save(
                BookingStatusHistory(
                    booking = booking,
                    previousStatus = "CONFIRMED",
                    newStatus = if (booking.status == BookingStatus.CANCELLED) "CANCELLED" else "CONFIRMED",
                    changedByUser = user,
                    reason = "Cancelled room item #${targetRoom.id}: ${request.reason}"
                )
            )
        }

        val updatedRooms = bookingRoomRepository.findByBookingId(booking.id)
        val activeSubtotal = updatedRooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
            .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
        val taxRate = getTaxRatePercentage()
        val activeTax = activeSubtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        val activeTotal = activeSubtotal.add(activeTax)

        return mapToDetailDto(booking, updatedRooms, folio, activeSubtotal, activeTax, activeTotal)
    }

    private fun getTaxRatePercentage(): BigDecimal {
        val setting = hotelSettingRepository.findBySettingKey("tax_rate_percentage").orElse(null)
        return setting?.settingValue?.toBigDecimalOrNull() ?: BigDecimal("10.00")
    }

    private fun validateDateRange(arrival: LocalDate, departure: LocalDate) {
        if (!departure.isAfter(arrival)) {
            throw BusinessException("Departure date must be strictly after arrival date.")
        }
        if (arrival.isBefore(LocalDate.now())) {
            throw BusinessException("Arrival date cannot be in the past.")
        }
    }

    private fun mapToDetailDto(
        booking: Booking,
        rooms: List<BookingRoom>,
        folio: GuestFolio?,
        subtotal: BigDecimal,
        tax: BigDecimal,
        total: BigDecimal
    ): BookingDetailDto {
        val totalNights = ChronoUnit.DAYS.between(booking.arrivalDate, booking.departureDate).toInt()
        val roomDtos = rooms.map { br ->
            BookingRoomDto(
                id = br.id,
                roomTypeId = br.roomType.id,
                roomTypeName = br.roomType.name,
                assignedRoomNumber = br.assignedRoom?.roomNumber,
                adultsCount = br.adultsCount,
                childrenCount = br.childrenCount,
                nightlyRateSnapshot = br.nightlyRateSnapshot,
                totalRoomCharge = br.totalRoomCharge,
                itemStatus = br.itemStatus
            )
        }

        return BookingDetailDto(
            id = booking.id,
            bookingReference = booking.bookingReference,
            guestName = booking.guest.user.fullName,
            guestEmail = booking.guest.user.email,
            arrivalDate = booking.arrivalDate,
            departureDate = booking.departureDate,
            totalNights = totalNights,
            status = booking.status,
            specialNotes = booking.specialNotes,
            rooms = roomDtos,
            subtotalCharges = subtotal,
            taxAmount = tax,
            totalAmount = total,
            folioId = folio?.id,
            outstandingBalance = folio?.getOutstandingBalance() ?: total,
            createdAt = booking.createdAt
        )
    }
}
