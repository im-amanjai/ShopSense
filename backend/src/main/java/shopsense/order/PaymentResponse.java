package shopsense.order;

public record PaymentResponse(
        Long orderId,
        PaymentStatus paymentStatus,
        OrderStatus orderStatus,
        String message
) {
}