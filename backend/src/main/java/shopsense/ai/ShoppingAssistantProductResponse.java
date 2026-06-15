package shopsense.ai;

import java.math.BigDecimal;

public record ShoppingAssistantProductResponse(
        Long productId,
        String name,
        String brand,
        BigDecimal price,
        Double averageRating,
        String reason
) {
}