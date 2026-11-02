package com.royalhotel.service

import com.royalhotel.dto.HotelInfoDto
import com.royalhotel.dto.RoomTypeDto
import com.royalhotel.repository.HotelSettingRepository
import com.royalhotel.repository.RoomTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class HotelService(
    private val hotelSettingRepository: HotelSettingRepository,
    private val roomTypeRepository: RoomTypeRepository
) {

    @Transactional(readOnly = true)
    fun getHotelInfo(): HotelInfoDto {
        val settings = hotelSettingRepository.findAll().associate { it.settingKey to it.settingValue }

        return HotelInfoDto(
            hotelName = settings["hotel_name"] ?: "Royal Hotel & Grand Spa",
            currency = settings["hotel_currency"] ?: "INR",
            currencySymbol = settings["hotel_currency_symbol"] ?: "₹",
            checkInTime = settings["check_in_time"] ?: "15:00",
            checkOutTime = settings["check_out_time"] ?: "11:00",
            taxRatePercentage = settings["tax_rate_percentage"]?.toBigDecimalOrNull() ?: BigDecimal("10.00"),
            address = settings["hotel_address"] ?: "100 Grand Boulevard, Royal City, RC 50401",
            phone = settings["hotel_phone"] ?: "+1 (800) 555-ROYAL",
            email = settings["hotel_email"] ?: "concierge@royalhotel.com"
        )
    }

    @Transactional(readOnly = true)
    fun getAllRoomTypes(): List<RoomTypeDto> {
        return roomTypeRepository.findByIsActiveTrue().map { rt ->
            RoomTypeDto(
                id = rt.id,
                name = rt.name,
                description = rt.description,
                basePricePerNight = rt.basePricePerNight,
                maxAdults = rt.maxAdults,
                maxChildren = rt.maxChildren,
                bedType = rt.bedType,
                sizeSqm = rt.sizeSqm,
                imageUrl = rt.imageUrl,
                amenities = rt.amenities.map { it.name }
            )
        }
    }
}
