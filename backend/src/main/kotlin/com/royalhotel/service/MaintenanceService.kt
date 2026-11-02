package com.royalhotel.service

import com.royalhotel.dto.*
import com.royalhotel.entity.*
import com.royalhotel.exception.ResourceNotFoundException
import com.royalhotel.repository.MaintenanceTicketRepository
import com.royalhotel.repository.RoomRepository
import com.royalhotel.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class MaintenanceService(
    private val maintenanceTicketRepository: MaintenanceTicketRepository,
    private val roomRepository: RoomRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun createTicket(userEmail: String, request: CreateMaintenanceTicketRequest): MaintenanceTicketDto {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val room = roomRepository.findById(request.roomId)
            .orElseThrow { ResourceNotFoundException("Room #${request.roomId} not found.") }

        val ticket = MaintenanceTicket(
            room = room,
            reportedByUser = user,
            category = request.category.trim(),
            description = request.description.trim(),
            severity = request.severity,
            status = TicketStatus.NEW
        )

        val saved = maintenanceTicketRepository.save(ticket)
        return mapToDto(saved)
    }

    @Transactional(readOnly = true)
    fun getAllTickets(status: TicketStatus?): List<MaintenanceTicketDto> {
        val list = if (status != null) {
            maintenanceTicketRepository.findByStatus(status)
        } else {
            maintenanceTicketRepository.findAll().sortedByDescending { it.createdAt }
        }

        return list.map { mapToDto(it) }
    }

    @Transactional
    fun updateTicket(id: Long, request: UpdateMaintenanceTicketRequest): MaintenanceTicketDto {
        val ticket = maintenanceTicketRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Maintenance ticket #$id not found.") }

        ticket.status = request.status

        if (request.assignedStaffId != null) {
            val staff = userRepository.findById(request.assignedStaffId)
                .orElseThrow { ResourceNotFoundException("Staff user #${request.assignedStaffId} not found.") }
            ticket.assignedStaff = staff
        }

        if (request.resolutionNotes != null) {
            ticket.resolutionNotes = request.resolutionNotes.trim()
        }

        if (request.status == TicketStatus.RESOLVED || request.status == TicketStatus.CLOSED) {
            ticket.resolvedAt = LocalDateTime.now()
        }

        val updated = maintenanceTicketRepository.save(ticket)
        return mapToDto(updated)
    }

    private fun mapToDto(t: MaintenanceTicket): MaintenanceTicketDto {
        return MaintenanceTicketDto(
            id = t.id,
            roomId = t.room.id,
            roomNumber = t.room.roomNumber,
            reportedByName = t.reportedByUser.fullName,
            category = t.category,
            description = t.description,
            severity = t.severity,
            status = t.status,
            assignedStaffName = t.assignedStaff?.fullName,
            resolutionNotes = t.resolutionNotes,
            createdAt = t.createdAt.toString(),
            resolvedAt = t.resolvedAt?.toString()
        )
    }
}
