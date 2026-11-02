package com.royalhotel.controller

import com.royalhotel.dto.ApiResponse
import com.royalhotel.dto.LoginRequest
import com.royalhotel.dto.RegisterRequest
import com.royalhotel.dto.UserProfileDto
import com.royalhotel.service.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<UserProfileDto>> {
        val userProfile = authService.login(request, httpRequest)
        return ResponseEntity.ok(ApiResponse.success(userProfile, "Login successful"))
    }

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: RegisterRequest
    ): ResponseEntity<ApiResponse<UserProfileDto>> {
        val userProfile = authService.register(request)
        return ResponseEntity.ok(ApiResponse.success(userProfile, "Registration successful"))
    }

    @PostMapping("/logout")
    fun logout(httpRequest: HttpServletRequest): ResponseEntity<ApiResponse<String>> {
        authService.logout(httpRequest)
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"))
    }

    @GetMapping("/me")
    fun getCurrentUser(
        @AuthenticationPrincipal userDetails: UserDetails?
    ): ResponseEntity<ApiResponse<UserProfileDto?>> {
        if (userDetails == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No active authenticated session"))
        }
        val profile = authService.getCurrentUserProfile(userDetails.username)
        return ResponseEntity.ok(ApiResponse.success(profile, "Authenticated user retrieved"))
    }
}
