package com.royalhotel.config

import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
class SecurityConfig {

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager =
        config.authenticationManager

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = listOf("http://localhost:5173", "http://127.0.0.1:5173")
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600L
        }
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .sessionManagement { session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            }
            .authorizeHttpRequests { auth ->
                auth
                    // Public endpoints
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/bookings/availability").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/hotel-info/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/dining/menu/**").permitAll()
                    .requestMatchers("/api/intelligence/**").permitAll()
                    // Preflight OPTIONS requests
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // All other requests require authentication
                    .anyRequest().authenticated()
            }
            .exceptionHandling { exceptions ->
                exceptions
                    .authenticationEntryPoint { _, response, authException ->
                        response.status = HttpServletResponse.SC_UNAUTHORIZED
                        response.contentType = MediaType.APPLICATION_JSON_VALUE
                        response.writer.write("""{"success":false,"message":"Authentication required: ${authException.message}"}""")
                    }
                    .accessDeniedHandler { _, response, accessDeniedException ->
                        response.status = HttpServletResponse.SC_FORBIDDEN
                        response.contentType = MediaType.APPLICATION_JSON_VALUE
                        response.writer.write("""{"success":false,"message":"Access denied: ${accessDeniedException.message}"}""")
                    }
            }

        return http.build()
    }
}
