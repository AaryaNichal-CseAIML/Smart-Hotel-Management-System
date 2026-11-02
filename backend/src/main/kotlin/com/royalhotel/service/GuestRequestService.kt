package com.royalhotel.service

import com.royalhotel.dto.*
import com.royalhotel.entity.*
import com.royalhotel.exception.BusinessException
import com.royalhotel.exception.ResourceNotFoundException
import com.royalhotel.exception.UnauthorizedException
import com.royalhotel.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class GuestRequestService(
    private val serviceRequestRepository: ServiceRequestRepository,
    private val bookingRoomRepository: BookingRoomRepository,
    private val bookingRepository: BookingRepository,
    private val guestRepository: GuestRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun createServiceRequest(userEmail: String, request: CreateServiceRequest): ServiceRequestDto {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val bookingRoom = bookingRoomRepository.findById(request.bookingRoomId)
            .orElseThrow { ResourceNotFoundException("Chamber booking #${request.bookingRoomId} not found.") }

        val booking = bookingRoom.booking
        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to submit service requests for this reservation.")
        }

        if (booking.status != BookingStatus.CONFIRMED && booking.status != BookingStatus.CHECKED_IN) {
            throw BusinessException("Service requests can only be made for confirmed or active stays.")
        }

        val serviceRequest = ServiceRequest(
            bookingRoom = bookingRoom,
            category = request.category,
            title = request.title.trim(),
            description = request.description.trim(),
            priority = request.priority,
            status = ServiceStatus.NEW
        )

        val saved = serviceRequestRepository.save(serviceRequest)
        return mapToDto(saved)
    }

    @Transactional(readOnly = true)
    fun getMyServiceRequests(userEmail: String): List<ServiceRequestDto> {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val guest = guestRepository.findByUserId(user.id).orElse(null)
            ?: return emptyList()

        val bookings = bookingRepository.findByGuestIdOrderByCreatedAtDesc(guest.id)
        val allBookingRoomIds = bookings.flatMap { b -> b.bookingRooms.map { it.id } }

        if (allBookingRoomIds.isEmpty()) return emptyList()

        // Fetch requests for all guest's rooms
        val allRequests = serviceRequestRepository.findAll()
            .filter { req -> allBookingRoomIds.contains(req.bookingRoom.id) }
            .sortedByDescending { it.createdAt }

        return allRequests.map { mapToDto(it) }
    }

    @Transactional(readOnly = true)
    fun getAllServiceRequests(status: ServiceStatus?, category: ServiceCategory?): List<ServiceRequestDto> {
        var list = serviceRequestRepository.findAll()

        if (status != null) {
            list = list.filter { it.status == status }
        }
        if (category != null) {
            list = list.filter { it.category == category }
        }

        return list.sortedByDescending { it.createdAt }.map { mapToDto(it) }
    }

    @Transactional
    fun updateServiceRequestStatus(id: Long, request: UpdateServiceRequestStatus): ServiceRequestDto {
        val serviceRequest = serviceRequestRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Service request #$id not found.") }

        serviceRequest.status = request.status

        if (request.assignedStaffId != null) {
            val staff = userRepository.findById(request.assignedStaffId)
                .orElseThrow { ResourceNotFoundException("Staff user #${request.assignedStaffId} not found.") }
            serviceRequest.assignedStaff = staff
        }

        if (request.status == ServiceStatus.COMPLETED) {
            serviceRequest.completedAt = LocalDateTime.now()
        }

        val updated = serviceRequestRepository.save(serviceRequest)
        return mapToDto(updated)
    }

    private fun mapToDto(req: ServiceRequest): ServiceRequestDto {
        return ServiceRequestDto(
            id = req.id,
            bookingReference = req.bookingRoom.booking.bookingReference,
            bookingRoomId = req.bookingRoom.id,
            roomNumber = req.bookingRoom.assignedRoom?.roomNumber,
            roomTypeName = req.bookingRoom.roomType.name,
            category = req.category,
            title = req.title,
            description = req.description,
            priority = req.priority,
            status = req.status,
            assignedStaffName = req.assignedStaff?.fullName,
            createdAt = req.createdAt.toString(),
            updatedAt = req.updatedAt.toString(),
            completedAt = req.completedAt?.toString()
        )
    }
}
