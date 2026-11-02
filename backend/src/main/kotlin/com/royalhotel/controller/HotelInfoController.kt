package com.royalhotel.controller

import com.royalhotel.dto.ApiResponse
import com.royalhotel.dto.HotelInfoDto
import com.royalhotel.dto.RoomTypeDto
import com.royalhotel.service.HotelService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class HotelInfoController(
    private val hotelService: HotelService
) {

    @GetMapping("/public/info")
    fun getHotelInfo(): ResponseEntity<ApiResponse<HotelInfoDto>> {
        val info = hotelService.getHotelInfo()
        return ResponseEntity.ok(ApiResponse.success(info, "Hotel information retrieved successfully"))
    }

    @GetMapping("/rooms")
    fun getAllRoomTypes(): ResponseEntity<ApiResponse<List<RoomTypeDto>>> {
        val rooms = hotelService.getAllRoomTypes()
        return ResponseEntity.ok(ApiResponse.success(rooms, "Active room types retrieved successfully"))
    }
}
