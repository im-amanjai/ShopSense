package shopsense.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import shopsense.inventory.Inventory;
import shopsense.inventory.InventoryRepository;
import shopsense.product.Product;
import shopsense.product.ProductRepository;
import shopsense.user.User;
import shopsense.user.UserRepository;
import shopsense.recommendation.RecommendationService;
import shopsense.recommendation.UserEventType;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;

    public CartResponse getCart(String email) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);
        return toResponse(cart);
    }

    public CartResponse addItem(String email, CartItemRequest request) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);

        Product product = productRepository.findById(request.productId())
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateStock(product.getId(), request.quantity());

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(0)
                        .priceAtTime(product.getPrice())
                        .build());

        int newQuantity = item.getQuantity() + request.quantity();
        validateStock(product.getId(), newQuantity);

        item.setQuantity(newQuantity);
        item.setPriceAtTime(product.getPrice());

        cartItemRepository.save(item);
        recommendationService.trackEvent(email, product.getId(), UserEventType.ADD_TO_CART);

        return toResponse(cartRepository.save(cart));
    }

    public CartResponse updateItem(String email, Long itemId, CartItemRequest request) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to current user");
        }

        Product product = productRepository.findById(request.productId())
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!item.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Product id cannot be changed for cart item");
        }

        validateStock(product.getId(), request.quantity());

        item.setQuantity(request.quantity());
        item.setPriceAtTime(product.getPrice());

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    public CartResponse removeItem(String email, Long itemId) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to current user");
        }

        cartItemRepository.delete(item);

        return toResponse(cart);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Cart getOrCreateActiveCart(User user) {
        return cartRepository.findByUserAndStatus(user, CartStatus.ACTIVE)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .user(user)
                                .status(CartStatus.ACTIVE)
                                .build()
                ));
    }

    private void validateStock(Long productId, Integer requestedQuantity) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found for product"));

        int availableToSell = inventory.getQuantityAvailable() - inventory.getReservedQuantity();

        if (requestedQuantity > availableToSell) {
            throw new IllegalArgumentException("Insufficient stock available");
        }
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems()
                .stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(
                cart.getId(),
                itemResponses,
                total
        );
    }

    private CartItemResponse toItemResponse(CartItem item) {
        BigDecimal lineTotal = item.getPriceAtTime()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getPriceAtTime(),
                item.getQuantity(),
                lineTotal
        );
    }
}