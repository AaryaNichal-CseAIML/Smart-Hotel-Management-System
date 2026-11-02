package com.royalhotel.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDateTime

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun <T> success(data: T, message: String = "Operation successful"): ApiResponse<T> =
            ApiResponse(success = true, message = message, data = data)

        fun <T> error(message: String): ApiResponse<T> =
            ApiResponse(success = false, message = message, data = null)
    }
}

data class LoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Valid email format required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

data class RegisterRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Valid email format required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, message = "Password must be at least 6 characters")
    val password: String,

    @field:NotBlank(message = "Full name is required")
    val fullName: String,

    val phoneNumber: String? = null,
    val identificationType: String? = null,
    val identificationNumber: String? = null
)

data class UserProfileDto(
    val id: Long,
    val email: String,
    val fullName: String,
    val phoneNumber: String?,
    val roles: List<String>,
    val guestId: Long? = null,
    val staffEmployeeCode: String? = null,
    val staffDepartment: String? = null
)

data class RoomTypeDto(
    val id: Long,
    val name: String,
    val description: String,
    val basePricePerNight: BigDecimal,
    val maxAdults: Int,
    val maxChildren: Int,
    val bedType: String,
    val sizeSqm: Int?,
    val imageUrl: String?,
    val amenities: List<String>
)

data class HotelInfoDto(
    val hotelName: String,
    val currency: String,
    val currencySymbol: String,
    val checkInTime: String,
    val checkOutTime: String,
    val taxRatePercentage: BigDecimal,
    val address: String,
    val phone: String,
    val email: String
)
