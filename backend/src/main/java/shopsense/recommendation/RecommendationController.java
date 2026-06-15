package shopsense.recommendation;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/api/recommendations/me")
    public List<RecommendationResponse> recommendForMe(Authentication authentication) {
        return recommendationService.recommendForUser(authentication.getName());
    }

    @GetMapping("/api/recommendations/popular")
    public List<RecommendationResponse> popularProducts() {
        return recommendationService.popularProducts();
    }

    @GetMapping("/api/products/{productId}/similar")
    public List<RecommendationResponse> similarProducts(@PathVariable Long productId) {
        return recommendationService.similarProducts(productId);
    }
}