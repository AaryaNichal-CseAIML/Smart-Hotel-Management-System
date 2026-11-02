package com.royalhotel.service

import com.royalhotel.dto.*
import com.royalhotel.entity.*
import com.royalhotel.exception.BusinessException
import com.royalhotel.exception.ResourceNotFoundException
import com.royalhotel.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class StaffOperationsService(
    private val roomRepository: RoomRepository,
    private val bookingRepository: BookingRepository,
    private val bookingRoomRepository: BookingRoomRepository,
    private val bookingStatusHistoryRepository: BookingStatusHistoryRepository,
    private val guestFolioRepository: GuestFolioRepository,
    private val userRepository: UserRepository,
    private val hotelSettingRepository: HotelSettingRepository,
    private val orderRepository: OrderRepository,
    private val serviceRequestRepository: ServiceRequestRepository,
    private val chargeRepository: ChargeRepository,
    private val auditLogRepository: AuditLogRepository
) {

    @Transactional(readOnly = true)
    fun getRoomsInventory(
        typeId: Long?,
        operationalStatus: OperationalStatus?,
        occupancyStatus: OccupancyStatus?
    ): List<RoomInventoryDto> {
        var rooms = roomRepository.findAll()

        if (typeId != null) {
            rooms = rooms.filter { it.roomType.id == typeId }
        }
        if (operationalStatus != null) {
            rooms = rooms.filter { it.operationalStatus == operationalStatus }
        }
        if (occupancyStatus != null) {
            rooms = rooms.filter { it.occupancyStatus == occupancyStatus }
        }

        return rooms.sortedBy { it.roomNumber }.map { mapToRoomDto(it) }
    }

    @Transactional
    fun updateRoomOperationalStatus(roomId: Long, newStatus: OperationalStatus): RoomInventoryDto {
        val room = roomRepository.findById(roomId)
            .orElseThrow { ResourceNotFoundException("Room #$roomId not found.") }

        room.operationalStatus = newStatus
        val saved = roomRepository.save(room)
        return mapToRoomDto(saved)
    }

    @Transactional
    fun performCheckIn(bookingId: Long, staffEmail: String, request: CheckInRequest): BookingDetailDto {
        val staffUser = userRepository.findByEmail(staffEmail)
            .orElseThrow { ResourceNotFoundException("Staff user not found: $staffEmail") }

        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { ResourceNotFoundException("Reservation #$bookingId not found.") }

        if (booking.status != BookingStatus.CONFIRMED) {
            throw BusinessException("Only confirmed reservations can be checked in. Current status: ${booking.status}.")
        }

        val bookingRooms = bookingRoomRepository.findByBookingId(booking.id)
            .filter { it.itemStatus != BookingRoomStatus.CANCELLED }

        if (bookingRooms.isEmpty()) {
            throw BusinessException("This reservation has no active room items to check in.")
        }

        // Process room allocations
        request.allocations.forEach { alloc ->
            val br = bookingRooms.find { it.id == alloc.bookingRoomId }
                ?: throw ResourceNotFoundException("Booking room item #${alloc.bookingRoomId} not found in reservation #${booking.bookingReference}.")

            val physicalRoom = roomRepository.findById(alloc.physicalRoomId)
                .orElseThrow { ResourceNotFoundException("Physical room #${alloc.physicalRoomId} not found.") }

            // Validate room readiness and type matching
            if (physicalRoom.roomType.id != br.roomType.id) {
                throw BusinessException("Assigned room '${physicalRoom.roomNumber}' is of category '${physicalRoom.roomType.name}', but booking item requires '${br.roomType.name}'.")
            }

            if (physicalRoom.operationalStatus != OperationalStatus.READY) {
                throw BusinessException("Room '${physicalRoom.roomNumber}' cannot be allocated because operational status is ${physicalRoom.operationalStatus} (Must be READY).")
            }

            if (physicalRoom.occupancyStatus != OccupancyStatus.VACANT) {
                throw BusinessException("Room '${physicalRoom.roomNumber}' is currently OCCUPIED.")
            }

            // Assign and mark occupied
            br.assignedRoom = physicalRoom
            br.itemStatus = BookingRoomStatus.CHECKED_IN
            physicalRoom.occupancyStatus = OccupancyStatus.OCCUPIED

            roomRepository.save(physicalRoom)
            bookingRoomRepository.save(br)
        }

        booking.status = BookingStatus.CHECKED_IN
        val savedBooking = bookingRepository.save(booking)

        bookingStatusHistoryRepository.save(
            BookingStatusHistory(
                booking = savedBooking,
                previousStatus = "CONFIRMED",
                newStatus = "CHECKED_IN",
                changedByUser = staffUser,
                reason = "Guest checked in at front desk; physical rooms allocated."
            )
        )

        val updatedRooms = bookingRoomRepository.findByBookingId(booking.id)
        val folio = guestFolioRepository.findByBookingId(booking.id).orElse(null)
        val subtotal = updatedRooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
            .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
        val taxRate = getTaxRatePercentage()
        val tax = subtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        val total = subtotal.add(tax)

        return mapToDetailDto(savedBooking, updatedRooms, folio, subtotal, tax, total)
    }

    @Transactional
    fun performCheckOut(bookingId: Long, staffEmail: String): BookingDetailDto {
        val staffUser = userRepository.findByEmail(staffEmail)
            .orElseThrow { ResourceNotFoundException("Staff user not found: $staffEmail") }

        val booking = bookingRepository.findById(bookingId)
            .orElseThrow { ResourceNotFoundException("Reservation #$bookingId not found.") }

        if (booking.status != BookingStatus.CHECKED_IN) {
            throw BusinessException("Only currently checked-in stays can be checked out. Current status: ${booking.status}.")
        }

        val bookingRooms = bookingRoomRepository.findByBookingId(booking.id)
            .filter { it.itemStatus == BookingRoomStatus.CHECKED_IN }

        // Transition rooms to VACANT and CLEANING
        bookingRooms.forEach { br ->
            br.itemStatus = BookingRoomStatus.CHECKED_OUT
            val physicalRoom = br.assignedRoom
            if (physicalRoom != null) {
                physicalRoom.occupancyStatus = OccupancyStatus.VACANT
                physicalRoom.operationalStatus = OperationalStatus.CLEANING // Triggers housekeeping turnover
                roomRepository.save(physicalRoom)
            }
            bookingRoomRepository.save(br)
        }

        booking.status = BookingStatus.CHECKED_OUT
        val savedBooking = bookingRepository.save(booking)

        bookingStatusHistoryRepository.save(
            BookingStatusHistory(
                booking = savedBooking,
                previousStatus = "CHECKED_IN",
                newStatus = "CHECKED_OUT",
                changedByUser = staffUser,
                reason = "Guest checked out; chambers transitioned to CLEANING."
            )
        )

        val updatedRooms = bookingRoomRepository.findByBookingId(booking.id)
        val folio = guestFolioRepository.findByBookingId(booking.id).orElse(null)
        val subtotal = updatedRooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
            .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
        val taxRate = getTaxRatePercentage()
        val tax = subtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
        val total = subtotal.add(tax)

        return mapToDetailDto(savedBooking, updatedRooms, folio, subtotal, tax, total)
    }

    @Transactional(readOnly = true)
    fun getAllStaffBookings(status: BookingStatus?): List<BookingDetailDto> {
        val bookings = if (status != null) {
            bookingRepository.findByStatus(status)
        } else {
            bookingRepository.findAll().sortedByDescending { it.createdAt }
        }

        val taxRate = getTaxRatePercentage()
        return bookings.map { b ->
            val rooms = bookingRoomRepository.findByBookingId(b.id)
            val folio = guestFolioRepository.findByBookingId(b.id).orElse(null)
            val subtotal = rooms.filter { it.itemStatus != BookingRoomStatus.CANCELLED }
                .fold(BigDecimal.ZERO) { acc, r -> acc.add(r.totalRoomCharge) }
            val tax = subtotal.multiply(taxRate).divide(BigDecimal(100), 2, RoundingMode.HALF_UP)
            val total = subtotal.add(tax)
            mapToDetailDto(b, rooms, folio, subtotal, tax, total)
        }
    }

    @Transactional(readOnly = true)
    fun getDashboardSummary(): StaffDashboardSummaryDto {
        val allRooms = roomRepository.findAll()
        val totalRooms = allRooms.size
        val occupiedRooms = allRooms.count { it.occupancyStatus == OccupancyStatus.OCCUPIED }
        val vacantReady = allRooms.count { it.occupancyStatus == OccupancyStatus.VACANT && it.operationalStatus == OperationalStatus.READY }
        val cleaning = allRooms.count { it.operationalStatus == OperationalStatus.CLEANING }
        val maintenance = allRooms.count { it.operationalStatus == OperationalStatus.MAINTENANCE }

        val today = LocalDate.now()
        val allBookings = bookingRepository.findAll()
        val activeReservations = allBookings.count { it.status == BookingStatus.CONFIRMED || it.status == BookingStatus.CHECKED_IN }
        val todayArrivals = allBookings.count { it.arrivalDate == today && it.status == BookingStatus.CONFIRMED }
        val todayDepartures = allBookings.count { it.departureDate == today && it.status == BookingStatus.CHECKED_IN }

        val pendingOrders = orderRepository.findAll().count { it.status == OrderStatus.NEW || it.status == OrderStatus.ACCEPTED || it.status == OrderStatus.PREPARING }
        val pendingRequests = serviceRequestRepository.findAll().count { it.status == ServiceStatus.NEW || it.status == ServiceStatus.ASSIGNED || it.status == ServiceStatus.IN_PROGRESS }

        return StaffDashboardSummaryDto(
            totalRooms = totalRooms,
            occupiedRooms = occupiedRooms,
            vacantReadyRooms = vacantReady,
            cleaningRooms = cleaning,
            maintenanceRooms = maintenance,
            activeReservationsCount = activeReservations,
            todayArrivalsCount = todayArrivals,
            todayDeparturesCount = todayDepartures,
            pendingOrdersCount = pendingOrders,
            pendingServiceRequestsCount = pendingRequests
        )
    }

    private fun mapToRoomDto(room: Room): RoomInventoryDto {
        return RoomInventoryDto(
            id = room.id,
            roomNumber = room.roomNumber,
            floorNumber = room.floorNumber,
            roomTypeId = room.roomType.id,
            roomTypeName = room.roomType.name,
            operationalStatus = room.operationalStatus,
            occupancyStatus = room.occupancyStatus,
            isActive = room.isActive
        )
    }

    private fun getTaxRatePercentage(): BigDecimal {
        val setting = hotelSettingRepository.findBySettingKey("tax_rate_percentage").orElse(null)
        return setting?.settingValue?.toBigDecimalOrNull() ?: BigDecimal("10.00")
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

    @Transactional(readOnly = true)
    fun getManagementAnalytics(): ManagementAnalyticsDto {
        val allRooms = roomRepository.findAll()
        val totalRooms = allRooms.size
        val occupiedRooms = allRooms.count { it.occupancyStatus == OccupancyStatus.OCCUPIED }
        val occupancyRate = if (totalRooms > 0) (occupiedRooms.toDouble() / totalRooms) * 100.0 else 0.0

        val allCharges = chargeRepository.findAll()
        val roomCharges = allCharges.filter { it.chargeCategory == ChargeCategory.ROOM }
            .map { it.totalAmount }.fold(BigDecimal.ZERO, BigDecimal::add)
        val fbCharges = allCharges.filter { it.chargeCategory == ChargeCategory.ROOM_SERVICE }
            .map { it.totalAmount }.fold(BigDecimal.ZERO, BigDecimal::add)
        val serviceCharges = allCharges.filter { it.chargeCategory == ChargeCategory.FACILITY }
            .map { it.totalAmount }.fold(BigDecimal.ZERO, BigDecimal::add)
        val totalRevenue = allCharges.map { it.totalAmount }.fold(BigDecimal.ZERO, BigDecimal::add)

        val totalBookings = bookingRepository.count()
        val completedStays = bookingRepository.findAll().count { it.status == BookingStatus.CHECKED_OUT }.toLong()

        val adr = if (occupiedRooms > 0) {
            roomCharges.divide(BigDecimal.valueOf(occupiedRooms.toLong()), 2, RoundingMode.HALF_UP)
        } else if (totalBookings > 0) {
            roomCharges.divide(BigDecimal.valueOf(totalBookings), 2, RoundingMode.HALF_UP)
        } else {
            BigDecimal("250.00")
        }

        val revPar = if (totalRooms > 0) {
            roomCharges.divide(BigDecimal.valueOf(totalRooms.toLong()), 2, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO
        }

        val logs = auditLogRepository.findTop50ByOrderByCreatedAtDesc().map { log ->
            AuditLogDto(
                id = log.id,
                actionType = log.actionType,
                entityName = log.entityName,
                entityId = log.entityId,
                oldValue = log.oldValue,
                newValue = log.newValue,
                userEmail = log.user?.email ?: "SYSTEM",
                createdAt = log.createdAt.toString()
            )
        }

        return ManagementAnalyticsDto(
            totalRevenue = totalRevenue,
            roomRevenue = roomCharges,
            foodAndBeverageRevenue = fbCharges,
            servicesRevenue = serviceCharges,
            totalBookings = totalBookings,
            completedStays = completedStays,
            totalRooms = totalRooms,
            occupiedRooms = occupiedRooms,
            occupancyRatePercentage = Math.round(occupancyRate * 10.0) / 10.0,
            averageDailyRate = adr,
            revPar = revPar,
            recentAuditLogs = logs
        )
    }
}
