package com.royalhotel.controller

import com.royalhotel.dto.*
import com.royalhotel.service.RecommendationService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/intelligence")
class RecommendationController(
    private val recommendationService: RecommendationService
) {

    @PostMapping("/recommendations")
    fun getRecommendations(
        @Valid @RequestBody request: RecommendationRequest
    ): ResponseEntity<ApiResponse<RecommendationResponse>> {
        val response = recommendationService.getRecommendations(request)
        return ResponseEntity.ok(ApiResponse.success(response, "Intelligent chamber recommendations generated."))
    }

    @GetMapping("/demand-forecast")
    fun getDemandForecast(): ResponseEntity<ApiResponse<DynamicDemandForecastDto>> {
        val forecast = recommendationService.getDemandForecast()
        return ResponseEntity.ok(ApiResponse.success(forecast, "Operational demand forecast retrieved."))
    }
}
