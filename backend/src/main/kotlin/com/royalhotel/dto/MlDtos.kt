package com.royalhotel.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class RecommendationRequest(
    @field:Min(value = 1, message = "Adults count must be at least 1")
    val adultsCount: Int = 2,

    val childrenCount: Int = 0,

    @field:NotNull(message = "Travel purpose is required")
    val travelPurpose: String = "LEISURE", // "LEISURE", "BUSINESS", "ROMANTIC", "FAMILY"

    val maxBudgetPerNight: BigDecimal? = null,

    val totalNights: Int = 2,

    val preferredAmenities: List<String> = emptyList()
)

data class RecommendedRoomDto(
    val roomTypeId: Long,
    val roomTypeName: String,
    val basePricePerNight: BigDecimal,
    val maxAdults: Int,
    val maxChildren: Int,
    val imageUrl: String?,
    val matchScore: Double, // 0 to 100
    val recommendationReason: String,
    val stageARank: Int,
    val stageBRank: Int,
    val cosineSimilarity: Double,
    val suitabilityHighlights: List<String>
)

data class DynamicDemandForecastDto(
    val totalChambers: Int,
    val occupiedChambers: Int,
    val currentOccupancyRate: Double,
    val demandTier: String, // "STANDARD", "MODERATE", "HIGH", "PEAK_LUXURY"
    val recommendedMultiplier: Double,
    val projectedRevPAR: BigDecimal,
    val optimizationAdvice: String
)

data class RecommendationResponse(
    val querySummary: String,
    val stageAExecutionMs: Long,
    val stageBExecutionMs: Long,
    val recommendations: List<RecommendedRoomDto>,
    val demandForecast: DynamicDemandForecastDto
)
