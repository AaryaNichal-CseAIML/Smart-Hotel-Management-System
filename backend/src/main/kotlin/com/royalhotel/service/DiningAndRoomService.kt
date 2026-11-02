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
class DiningAndRoomService(
    private val menuItemRepository: MenuItemRepository,
    private val orderRepository: OrderRepository,
    private val bookingRoomRepository: BookingRoomRepository,
    private val bookingRepository: BookingRepository,
    private val guestRepository: GuestRepository,
    private val userRepository: UserRepository,
    private val guestFolioRepository: GuestFolioRepository,
    private val chargeRepository: ChargeRepository
) {

    @Transactional(readOnly = true)
    fun getMenu(category: MenuCategory?): List<MenuItemDto> {
        val items = if (category != null) {
            menuItemRepository.findByCategoryAndIsAvailableTrue(category)
        } else {
            menuItemRepository.findByIsAvailableTrue()
        }

        return items.map { item ->
            MenuItemDto(
                id = item.id,
                name = item.name,
                category = item.category,
                description = item.description,
                price = item.price,
                isVegetarian = item.isVegetarian,
                isAvailable = item.isAvailable
            )
        }
    }

    @Transactional
    fun createOrder(userEmail: String, request: CreateOrderRequest): OrderDto {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val bookingRoom = bookingRoomRepository.findById(request.bookingRoomId)
            .orElseThrow { ResourceNotFoundException("Chamber booking item #${request.bookingRoomId} not found.") }

        val booking = bookingRoom.booking
        val isOwner = booking.guest.user.id == user.id
        val isStaff = user.roles.any { it.name != "ROLE_GUEST" }
        if (!isOwner && !isStaff) {
            throw UnauthorizedException("You are not authorized to place orders for chamber #${bookingRoom.id}.")
        }

        if (booking.status != BookingStatus.CONFIRMED && booking.status != BookingStatus.CHECKED_IN) {
            throw BusinessException("Dining orders can only be placed for confirmed or active stays.")
        }

        if (bookingRoom.itemStatus == BookingRoomStatus.CANCELLED) {
            throw BusinessException("Cannot place order for a cancelled chamber reservation.")
        }

        // Validate menu items & calculate totals
        var grandTotal = BigDecimal.ZERO
        val preparedOrderItems = mutableListOf<OrderItem>()

        val orderRef = "ORD-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" +
                UUID.randomUUID().toString().substring(0, 4).uppercase()

        val newOrder = Order(
            orderReference = orderRef,
            bookingRoom = bookingRoom,
            status = OrderStatus.NEW,
            specialInstructions = request.specialInstructions?.trim()?.ifEmpty { null },
            totalAmount = BigDecimal.ZERO
        )

        request.items.forEach { reqItem ->
            val menuItem = menuItemRepository.findById(reqItem.menuItemId)
                .orElseThrow { ResourceNotFoundException("Menu item #${reqItem.menuItemId} not found.") }

            if (!menuItem.isAvailable) {
                throw BusinessException("Menu item '${menuItem.name}' is currently unavailable.")
            }

            val itemTotal = menuItem.price.multiply(BigDecimal(reqItem.quantity))
            grandTotal = grandTotal.add(itemTotal)

            preparedOrderItems.add(
                OrderItem(
                    order = newOrder,
                    menuItem = menuItem,
                    quantity = reqItem.quantity,
                    unitPriceSnapshot = menuItem.price,
                    totalPrice = itemTotal
                )
            )
        }

        newOrder.totalAmount = grandTotal
        newOrder.items = preparedOrderItems

        val savedOrder = orderRepository.save(newOrder)

        // Automatically consolidate charge to Guest Folio
        val folio = guestFolioRepository.findByBookingId(booking.id).orElse(null)
        if (folio != null) {
            chargeRepository.save(
                Charge(
                    folio = folio,
                    bookingRoom = bookingRoom,
                    chargeCategory = ChargeCategory.ROOM_SERVICE,
                    description = "In-Room Dining: $orderRef",
                    unitPrice = grandTotal,
                    quantity = 1,
                    totalAmount = grandTotal
                )
            )
            folio.totalCharges = folio.totalCharges.add(grandTotal)
            guestFolioRepository.save(folio)
        }

        return mapToOrderDto(savedOrder)
    }

    @Transactional(readOnly = true)
    fun getMyOrders(userEmail: String): List<OrderDto> {
        val user = userRepository.findByEmail(userEmail)
            .orElseThrow { ResourceNotFoundException("User not found: $userEmail") }

        val guest = guestRepository.findByUserId(user.id).orElse(null)
            ?: return emptyList()

        val bookings = bookingRepository.findByGuestIdOrderByCreatedAtDesc(guest.id)
        val allBookingRoomIds = bookings.flatMap { b -> b.bookingRooms.map { it.id } }

        if (allBookingRoomIds.isEmpty()) return emptyList()

        val allOrders = allBookingRoomIds.flatMap { brId ->
            orderRepository.findByBookingRoomId(brId)
        }.sortedByDescending { it.createdAt }

        return allOrders.map { mapToOrderDto(it) }
    }

    @Transactional(readOnly = true)
    fun getAllOrders(status: OrderStatus?): List<OrderDto> {
        val orders = if (status != null) {
            orderRepository.findByStatus(status)
        } else {
            orderRepository.findAll().sortedByDescending { it.createdAt }
        }

        return orders.map { mapToOrderDto(it) }
    }

    @Transactional
    fun updateOrderStatus(orderId: Long, newStatus: OrderStatus): OrderDto {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResourceNotFoundException("Order with ID $orderId not found.") }

        order.status = newStatus
        val saved = orderRepository.save(order)
        return mapToOrderDto(saved)
    }

    private fun mapToOrderDto(order: Order): OrderDto {
        return OrderDto(
            id = order.id,
            orderReference = order.orderReference,
            bookingReference = order.bookingRoom.booking.bookingReference,
            bookingRoomId = order.bookingRoom.id,
            roomNumber = order.bookingRoom.assignedRoom?.roomNumber,
            roomTypeName = order.bookingRoom.roomType.name,
            status = order.status,
            specialInstructions = order.specialInstructions,
            totalAmount = order.totalAmount,
            items = order.items.map { item ->
                OrderItemDto(
                    id = item.id,
                    menuItemId = item.menuItem.id,
                    menuItemName = item.menuItem.name,
                    quantity = item.quantity,
                    unitPriceSnapshot = item.unitPriceSnapshot,
                    totalPrice = item.totalPrice
                )
            },
            createdAt = order.createdAt.toString(),
            updatedAt = order.updatedAt.toString()
        )
    }
}
