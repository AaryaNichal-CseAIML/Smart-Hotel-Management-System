package com.royalhotel.config

import com.royalhotel.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    @Transactional(readOnly = true)
    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("No user found with email: $email") }

        if (!user.isActive) {
            throw UsernameNotFoundException("User account is inactive")
        }

        val authorities = mutableSetOf<SimpleGrantedAuthority>()

        user.roles.forEach { role ->
            // Standard Spring Security role format: ROLE_GUEST, ROLE_ADMIN, etc.
            authorities.add(SimpleGrantedAuthority(role.name))
            role.permissions.forEach { permission ->
                authorities.add(SimpleGrantedAuthority(permission.name))
            }
        }

        return User(
            user.email,
            user.passwordHash,
            user.isActive,
            true,
            true,
            true,
            authorities
        )
    }
}
