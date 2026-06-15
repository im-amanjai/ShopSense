package shopsense.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Long orderId,
        BigDecimal totalAmount,
        PaymentStatus paymentStatus,
        OrderStatus orderStatus,
        Instant createdAt,
        List<OrderItemResponse> items
) {
}