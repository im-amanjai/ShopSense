package shopsense.order;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse placeOrder(Authentication authentication) {
        return orderService.placeOrder(authentication.getName());
    }

    @GetMapping
    public List<OrderResponse> findMyOrders(Authentication authentication) {
        return orderService.findMyOrders(authentication.getName());
    }

    @GetMapping("/{orderId}")
    public OrderResponse findMyOrderById(
            Authentication authentication,
            @PathVariable Long orderId
    ) {
        return orderService.findMyOrderById(authentication.getName(), orderId);
    }
    @PostMapping("/{orderId}/payment/mock")
    public PaymentResponse mockPayment(
            Authentication authentication,
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentRequest request
    ) {
        return orderService.mockPayment(authentication.getName(), orderId, request);
    }
}