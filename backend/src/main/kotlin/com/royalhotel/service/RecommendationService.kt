package com.royalhotel.service

import com.royalhotel.dto.*
import com.royalhotel.entity.OccupancyStatus
import com.royalhotel.entity.RoomType
import com.royalhotel.repository.RoomRepository
import com.royalhotel.repository.RoomTypeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.pow
import kotlin.math.sqrt

@Service
class RecommendationService(
    private val roomTypeRepository: RoomTypeRepository,
    private val roomRepository: RoomRepository
) {

    @Transactional(readOnly = true)
    fun getRecommendations(request: RecommendationRequest): RecommendationResponse {
        val roomTypes = roomTypeRepository.findByIsActiveTrue()
        val querySummary = "Recommendation inquiry for ${request.adultsCount} Adults, ${request.childrenCount} Children, ${request.totalNights} Nights (${request.travelPurpose})"

        // Stage A Execution (Heuristics)
        val stageAStart = System.currentTimeMillis()
        val stageAScores = evaluateStageAHeuristics(roomTypes, request)
        val stageAElapsed = (System.currentTimeMillis() - stageAStart).coerceAtLeast(1)

        // Stage B Execution (Cosine Feature Vector ML Engine)
        val stageBStart = System.currentTimeMillis()
        val stageBScores = evaluateStageBMachineLearning(roomTypes, request)
        val stageBElapsed = (System.currentTimeMillis() - stageBStart).coerceAtLeast(1)

        // Combine and generate explainable rankings
        val combinedList = roomTypes.map { rt ->
            val scoreA = stageAScores[rt.id] ?: 50.0
            val scoreB = stageBScores[rt.id] ?: 0.50

            val cosineSim = scoreB
            val finalMatchScore = (scoreA * 0.4 + (scoreB * 100.0) * 0.6)
                .coerceIn(10.0, 99.0)

            val highlights = mutableListOf<String>()
            if (rt.maxAdults >= request.adultsCount) highlights.add("Accommodates entire party")
            if (request.travelPurpose == "BUSINESS" && rt.name.contains("Executive")) highlights.add("Executive ocean work desk & high-speed Wi-Fi")
            if (request.travelPurpose == "ROMANTIC" && rt.name.contains("Penthouse")) highlights.add("Private terrace jacuzzi & panoramic vistas")
            if (request.travelPurpose == "FAMILY" && rt.bedType.contains("2")) highlights.add("Twin beds suited for children & guests")
            if (request.maxBudgetPerNight != null && rt.basePricePerNight <= request.maxBudgetPerNight) highlights.add("Within specified nightly budget")

            val reason = generateExplanation(rt, request, finalMatchScore)

            RecommendedRoomDto(
                roomTypeId = rt.id,
                roomTypeName = rt.name,
                basePricePerNight = rt.basePricePerNight,
                maxAdults = rt.maxAdults,
                maxChildren = rt.maxChildren,
                imageUrl = rt.imageUrl,
                matchScore = BigDecimal(finalMatchScore).setScale(1, RoundingMode.HALF_UP).toDouble(),
                recommendationReason = reason,
                stageARank = 0, // Assigned after sorting
                stageBRank = 0, // Assigned after sorting
                cosineSimilarity = BigDecimal(cosineSim).setScale(4, RoundingMode.HALF_UP).toDouble(),
                suitabilityHighlights = highlights
            )
        }

        // Rank sorting
        val sortedByFinal = combinedList.sortedByDescending { it.matchScore }
        val sortedByA = combinedList.sortedByDescending { stageAScores[it.roomTypeId] ?: 0.0 }
        val sortedByB = combinedList.sortedByDescending { stageBScores[it.roomTypeId] ?: 0.0 }

        val rankedList = sortedByFinal.mapIndexed { idx, item ->
            val rankA = sortedByA.indexOfFirst { it.roomTypeId == item.roomTypeId } + 1
            val rankB = sortedByB.indexOfFirst { it.roomTypeId == item.roomTypeId } + 1
            item.copy(stageARank = rankA, stageBRank = rankB)
        }

        val forecast = calculateDemandForecast()

        return RecommendationResponse(
            querySummary = querySummary,
            stageAExecutionMs = stageAElapsed,
            stageBExecutionMs = stageBElapsed,
            recommendations = rankedList,
            demandForecast = forecast
        )
    }

    @Transactional(readOnly = true)
    fun getDemandForecast(): DynamicDemandForecastDto {
        return calculateDemandForecast()
    }

    private fun evaluateStageAHeuristics(roomTypes: List<RoomType>, req: RecommendationRequest): Map<Long, Double> {
        val scoreMap = mutableMapOf<Long, Double>()

        roomTypes.forEach { rt ->
            var score = 60.0

            // Party capacity
            if (rt.maxAdults >= req.adultsCount && rt.maxChildren >= req.childrenCount) {
                score += 20.0
            } else if (rt.maxAdults < req.adultsCount) {
                score -= 30.0
            }

            // Budget match
            if (req.maxBudgetPerNight != null) {
                if (rt.basePricePerNight <= req.maxBudgetPerNight) {
                    score += 15.0
                } else {
                    score -= 25.0
                }
            }

            // Purpose heuristic rules
            when (req.travelPurpose.uppercase()) {
                "BUSINESS" -> {
                    if (rt.name.contains("Executive", ignoreCase = true)) score += 25.0
                    if (rt.name.contains("King", ignoreCase = true)) score += 10.0
                }
                "ROMANTIC" -> {
                    if (rt.name.contains("Penthouse", ignoreCase = true)) score += 30.0
                    if (rt.name.contains("Executive", ignoreCase = true)) score += 15.0
                    if (rt.name.contains("Twin", ignoreCase = true)) score -= 20.0
                }
                "FAMILY" -> {
                    if (rt.name.contains("Twin", ignoreCase = true) && req.childrenCount > 0) score += 25.0
                    if (rt.name.contains("Penthouse", ignoreCase = true)) score += 20.0
                }
                "LEISURE" -> {
                    if (rt.name.contains("Deluxe", ignoreCase = true)) score += 20.0
                    if (rt.name.contains("Executive", ignoreCase = true)) score += 15.0
                }
            }

            scoreMap[rt.id] = score.coerceIn(10.0, 99.0)
        }

        return scoreMap
    }

    private fun evaluateStageBMachineLearning(roomTypes: List<RoomType>, req: RecommendationRequest): Map<Long, Double> {
        // Construct Target Inquiry Vector [price, size, capacity, luxury, business, romance, family]
        val targetBudget = req.maxBudgetPerNight?.toDouble() ?: 350.0
        val targetPriceNorm = ((targetBudget - 150.0) / 500.0).coerceIn(0.0, 1.0)
        val targetCapNorm = ((req.adultsCount + req.childrenCount * 0.5) / 5.0).coerceIn(0.0, 1.0)
        val targetSizeNorm = (req.totalNights.toDouble() / 7.0).coerceIn(0.2, 1.0)

        val targetBusiness = if (req.travelPurpose == "BUSINESS") 1.0 else 0.2
        val targetRomance = if (req.travelPurpose == "ROMANTIC") 1.0 else 0.2
        val targetFamily = if (req.travelPurpose == "FAMILY" || req.childrenCount > 0) 1.0 else 0.2
        val targetLuxury = if (targetBudget > 400.0 || req.travelPurpose == "ROMANTIC") 0.9 else 0.5

        val targetVector = doubleArrayOf(
            targetPriceNorm,
            targetSizeNorm,
            targetCapNorm,
            targetLuxury,
            targetBusiness,
            targetRomance,
            targetFamily
        )

        val simMap = mutableMapOf<Long, Double>()

        roomTypes.forEach { rt ->
            val priceNorm = ((rt.basePricePerNight.toDouble() - 150.0) / 500.0).coerceIn(0.0, 1.0)
            val sizeNorm = (((rt.sizeSqm ?: 38) - 30.0) / 90.0).coerceIn(0.0, 1.0)
            val capNorm = ((rt.maxAdults + rt.maxChildren * 0.5) / 5.0).coerceIn(0.0, 1.0)

            val luxuryScore = when {
                rt.name.contains("Penthouse") -> 1.0
                rt.name.contains("Executive") -> 0.8
                rt.name.contains("King") -> 0.6
                else -> 0.4
            }

            val businessScore = when {
                rt.name.contains("Executive") -> 1.0
                rt.name.contains("King") -> 0.7
                rt.name.contains("Penthouse") -> 0.8
                else -> 0.4
            }

            val romanceScore = when {
                rt.name.contains("Penthouse") -> 1.0
                rt.name.contains("Executive") -> 0.8
                rt.name.contains("King") -> 0.6
                else -> 0.2
            }

            val familyScore = when {
                rt.name.contains("Twin") -> 0.9
                rt.name.contains("Penthouse") -> 0.9
                rt.name.contains("Executive") -> 0.7
                else -> 0.3
            }

            val roomVector = doubleArrayOf(
                priceNorm,
                sizeNorm,
                capNorm,
                luxuryScore,
                businessScore,
                romanceScore,
                familyScore
            )

            val cosineSim = computeCosineSimilarity(targetVector, roomVector)
            simMap[rt.id] = cosineSim
        }

        return simMap
    }

    private fun computeCosineSimilarity(vecA: DoubleArray, vecB: DoubleArray): Double {
        var dotProduct = 0.0
        var normA = 0.0
        var normB = 0.0

        for (i in vecA.indices) {
            dotProduct += vecA[i] * vecB[i]
            normA += vecA[i].pow(2.0)
            normB += vecB[i].pow(2.0)
        }

        val denominator = sqrt(normA) * sqrt(normB)
        return if (denominator > 0) (dotProduct / denominator).coerceIn(0.0, 1.0) else 0.0
    }

    private fun generateExplanation(rt: RoomType, req: RecommendationRequest, score: Double): String {
        return when {
            score >= 90.0 -> "Optimal Match: ${rt.name} aligns exceptionally with your ${req.travelPurpose.lowercase()} itinerary, party size (${req.adultsCount} adults), and luxury expectations."
            score >= 75.0 -> "Strong Contender: ${rt.name} offers well-balanced capacity and amenities tailored for a ${req.totalNights}-night stay."
            else -> "Alternative Option: Accommodates guests seeking alternative layout configurations."
        }
    }

    private fun calculateDemandForecast(): DynamicDemandForecastDto {
        val totalRooms = roomRepository.count().toInt()
        val occupied = roomRepository.findAll().count { it.occupancyStatus == OccupancyStatus.OCCUPIED }
        val occupancyRate = if (totalRooms > 0) occupied.toDouble() / totalRooms.toDouble() else 0.0

        val (tier, multiplier, advice) = when {
            occupancyRate >= 0.85 -> Triple("PEAK_LUXURY", 1.35, "Peak demand detected (≥85% occupancy). Recommend premium rate yield optimization.")
            occupancyRate >= 0.65 -> Triple("HIGH", 1.20, "High demand trajectory. Recommend modest yield uplift and guaranteed deposit mandates.")
            occupancyRate >= 0.40 -> Triple("MODERATE", 1.10, "Balanced property occupancy. Nominal dynamic rates apply.")
            else -> Triple("STANDARD", 1.00, "Standard baseline rates active. Capacity available for group and extended stay promotions.")
        }

        val baseRevPAR = BigDecimal(240.00).multiply(BigDecimal(multiplier))

        return DynamicDemandForecastDto(
            totalChambers = totalRooms,
            occupiedChambers = occupied,
            currentOccupancyRate = BigDecimal(occupancyRate * 100).setScale(1, RoundingMode.HALF_UP).toDouble(),
            demandTier = tier,
            recommendedMultiplier = multiplier,
            projectedRevPAR = baseRevPAR.setScale(2, RoundingMode.HALF_UP),
            optimizationAdvice = advice
        )
    }
}
