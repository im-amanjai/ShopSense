package shopsense.cart;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(Authentication authentication) {
        return cartService.getCart(authentication.getName());
    }

    @PostMapping("/items")
    public CartResponse addItem(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request
    ) {
        return cartService.addItem(authentication.getName(), request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest request
    ) {
        return cartService.updateItem(authentication.getName(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {
        return cartService.removeItem(authentication.getName(), itemId);
    }
}