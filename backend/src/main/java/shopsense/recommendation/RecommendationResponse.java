package shopsense.recommendation;

import java.math.BigDecimal;

public record RecommendationResponse(
        Long productId,
        String name,
        String brand,
        String categoryName,
        BigDecimal price,
        String imageUrl,
        Double averageRating,
        String reason,
        Double score
) {
}