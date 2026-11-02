package com.royalhotel.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 191)
    val email: String,

    @Column(name = "password_hash", nullable = false)
    var passwordHash: String,

    @Column(name = "full_name", nullable = false, length = 150)
    var fullName: String,

    @Column(name = "phone_number", length = 30)
    var phoneNumber: String? = null,

    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = [JoinColumn(name = "user_id")],
        inverseJoinColumns = [JoinColumn(name = "role_id")]
    )
    var roles: MutableSet<Role> = mutableSetOf(),

    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var guestProfile: Guest? = null,

    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var staffProfile: StaffProfile? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}

@Entity
@Table(name = "roles")
data class Role(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 50)
    val name: String,

    @Column(length = 255)
    val description: String? = null,

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = [JoinColumn(name = "role_id")],
        inverseJoinColumns = [JoinColumn(name = "permission_id")]
    )
    var permissions: MutableSet<Permission> = mutableSetOf()
)

@Entity
@Table(name = "permissions")
data class Permission(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val name: String,

    @Column(length = 255)
    val description: String? = null
)

@Entity
@Table(name = "guests")
data class Guest(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    @Column(name = "identification_type", length = 50)
    var identificationType: String? = null,

    @Column(name = "identification_number", length = 100)
    var identificationNumber: String? = null,

    @Column(name = "preferred_language", length = 20)
    var preferredLanguage: String = "en",

    @Column(name = "dietary_preferences", columnDefinition = "TEXT")
    var dietaryPreferences: String? = null,

    @Column(name = "special_requests", columnDefinition = "TEXT")
    var specialRequests: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

@Entity
@Table(name = "staff_profiles")
data class StaffProfile(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    val user: User,

    @Column(name = "employee_code", nullable = false, unique = true, length = 50)
    val employeeCode: String,

    @Column(nullable = false, length = 50)
    var department: String,

    @Column(nullable = false, length = 30)
    var shift: String = "DAY",

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)
