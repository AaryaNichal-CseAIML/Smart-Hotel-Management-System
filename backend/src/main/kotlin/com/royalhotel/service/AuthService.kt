package com.royalhotel.service

import com.royalhotel.dto.LoginRequest
import com.royalhotel.dto.RegisterRequest
import com.royalhotel.dto.UserProfileDto
import com.royalhotel.entity.Guest
import com.royalhotel.entity.User
import com.royalhotel.exception.DuplicateResourceException
import com.royalhotel.exception.ResourceNotFoundException
import com.royalhotel.repository.GuestRepository
import com.royalhotel.repository.RoleRepository
import com.royalhotel.repository.UserRepository
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val guestRepository: GuestRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager
) {

    @Transactional
    fun login(request: LoginRequest, httpRequest: HttpServletRequest): UserProfileDto {
        val authToken = UsernamePasswordAuthenticationToken(request.email, request.password)
        val authentication = authenticationManager.authenticate(authToken)

        val securityContext = SecurityContextHolder.createEmptyContext()
        securityContext.authentication = authentication
        SecurityContextHolder.setContext(securityContext)

        // Bind Spring Security context to HTTP Session for persistent cookie
        val session = httpRequest.getSession(true)
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext)

        return getCurrentUserProfile(request.email)
    }

    @Transactional
    fun register(request: RegisterRequest): UserProfileDto {
        if (userRepository.existsByEmail(request.email)) {
            throw DuplicateResourceException("An account with email '${request.email}' already exists.")
        }

        val guestRole = roleRepository.findByName("ROLE_GUEST")
            .orElseThrow { ResourceNotFoundException("Role 'ROLE_GUEST' not found") }

        val newUser = User(
            email = request.email,
            passwordHash = passwordEncoder.encode(request.password) ?: "",
            fullName = request.fullName,
            phoneNumber = request.phoneNumber,
            isActive = true,
            roles = mutableSetOf(guestRole)
        )
        val savedUser = userRepository.save(newUser)

        val guestProfile = Guest(
            user = savedUser,
            identificationType = request.identificationType,
            identificationNumber = request.identificationNumber
        )
        guestRepository.save(guestProfile)

        return mapToProfileDto(savedUser, guestProfile.id, null, null)
    }

    @Transactional(readOnly = true)
    fun getCurrentUserProfile(email: String): UserProfileDto {
        val user = userRepository.findByEmail(email)
            .orElseThrow { ResourceNotFoundException("User not found with email: $email") }

        val guestId = user.guestProfile?.id
        val staffEmployeeCode = user.staffProfile?.employeeCode
        val staffDepartment = user.staffProfile?.department

        return mapToProfileDto(user, guestId, staffEmployeeCode, staffDepartment)
    }

    fun logout(httpRequest: HttpServletRequest) {
        val session = httpRequest.getSession(false)
        session?.invalidate()
        SecurityContextHolder.clearContext()
    }

    private fun mapToProfileDto(
        user: User,
        guestId: Long?,
        staffCode: String?,
        department: String?
    ): UserProfileDto {
        return UserProfileDto(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            phoneNumber = user.phoneNumber,
            roles = user.roles.map { it.name },
            guestId = guestId,
            staffEmployeeCode = staffCode,
            staffDepartment = department
        )
    }
}
