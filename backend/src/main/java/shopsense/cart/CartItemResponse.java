package shopsense.cart;

import java.math.BigDecimal;

public record CartItemResponse(
        Long itemId,
        Long productId,
        String productName,
        String imageUrl,
        BigDecimal priceAtTime,
        Integer quantity,
        BigDecimal lineTotal
) {
}