package shopsense.ai;

import java.math.BigDecimal;

public record SemanticSearchResponse(
        Long productId,
        String name,
        String brand,
        String categoryName,
        BigDecimal price,
        String imageUrl,
        Double averageRating,
        Double similarityScore
) {
}