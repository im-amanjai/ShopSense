package shopsense.product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        String brand,
        String imageUrl,
        Double averageRating,
        Boolean active,
        Long categoryId,
        String categoryName
) {
}