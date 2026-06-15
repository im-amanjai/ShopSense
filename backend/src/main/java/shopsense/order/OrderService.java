package shopsense.order;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopsense.cart.Cart;
import shopsense.cart.CartRepository;
import shopsense.cart.CartStatus;
import shopsense.inventory.Inventory;
import shopsense.inventory.InventoryRepository;
import shopsense.user.User;
import shopsense.user.UserRepository;
import shopsense.recommendation.RecommendationService;
import shopsense.recommendation.UserEventType;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;

    @Transactional
    public OrderResponse placeOrder(String email) {
        User user = findUser(email);

        Cart cart = cartRepository.findByUserAndStatus(user, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Active cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PLACED)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (var cartItem : cart.getItems()) {
            Inventory inventory = inventoryRepository
                    .findByProductIdForUpdate(cartItem.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Inventory not found"));

            int availableToSell = inventory.getQuantityAvailable() - inventory.getReservedQuantity();

            if (cartItem.getQuantity() > availableToSell) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + cartItem.getProduct().getName()
                );
            }

            inventory.setQuantityAvailable(inventory.getQuantityAvailable() - cartItem.getQuantity());
            inventoryRepository.save(inventory);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(cartItem.getPriceAtTime())
                    .build();

            order.getItems().add(orderItem);

            total = total.add(
                    cartItem.getPriceAtTime().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
            recommendationService.trackEvent(email, cartItem.getProduct().getId(), UserEventType.PURCHASE);
        }

        order.setTotalAmount(total);

        cart.setStatus(CartStatus.CHECKED_OUT);

        Order savedOrder = orderRepository.save(order);
        cartRepository.save(cart);

        return toResponse(savedOrder);
    }

    public List<OrderResponse> findMyOrders(String email) {
        User user = findUser(email);

        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse findMyOrderById(String email, Long orderId) {
        User user = findUser(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Order does not belong to current user");
        }

        return toResponse(order);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems()
                .stream()
                .map(item -> {
                    BigDecimal lineTotal = item.getPriceAtPurchase()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return new OrderItemResponse(
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            item.getPriceAtPurchase(),
                            lineTotal
                    );
                })
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getTotalAmount(),
                order.getPaymentStatus(),
                order.getOrderStatus(),
                order.getCreatedAt(),
                itemResponses
        );
    }
    @Transactional
    public PaymentResponse mockPayment(String email, Long orderId, PaymentRequest request) {
        User user = findUser(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Order does not belong to current user");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Order is already paid");
        }

        if (request.success()) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setOrderStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);

            return new PaymentResponse(
                    order.getId(),
                    order.getPaymentStatus(),
                    order.getOrderStatus(),
                    "Payment successful"
            );
        }

        order.setPaymentStatus(PaymentStatus.FAILED);
        orderRepository.save(order);

        return new PaymentResponse(
                order.getId(),
                order.getPaymentStatus(),
                order.getOrderStatus(),
                "Payment failed"
        );
    }
}