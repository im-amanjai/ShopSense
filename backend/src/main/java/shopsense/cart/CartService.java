package shopsense.cart;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional
    public CartResponse getCart(String email) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, CartItemRequest request) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);

        Product product = productRepository.findById(request.productId())
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        validateStock(product.getId(), request.quantity());

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(0)
                        .priceAtTime(product.getPrice())
                        .build();
                    cart.getItems().add(newItem);
                    return newItem;
                });

        int newQuantity = item.getQuantity() + request.quantity();
        validateStock(product.getId(), newQuantity);

        item.setQuantity(newQuantity);
        item.setPriceAtTime(product.getPrice());

        cartItemRepository.save(item);
        recommendationService.trackEvent(email, product.getId(), UserEventType.ADD_TO_CART);

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
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

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        User user = findUser(email);
        Cart cart = getOrCreateActiveCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new IllegalArgumentException("Cart item does not belong to current user");
        }

        cartItemRepository.delete(item);
        cart.getItems().removeIf(cartItem -> cartItem.getId().equals(itemId));

        return toResponse(cart);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Cart getOrCreateActiveCart(User user) {
        List<Cart> activeCarts = cartRepository.findAllByUserAndStatusOrderByUpdatedAtDesc(user, CartStatus.ACTIVE);

        if (activeCarts.isEmpty()) {
            return cartRepository.save(
                    Cart.builder()
                            .user(user)
                            .status(CartStatus.ACTIVE)
                            .build()
            );
        }

        Cart activeCart = activeCarts.getFirst();

        if (activeCarts.size() > 1) {
            activeCarts.stream()
                    .skip(1)
                    .forEach(cart -> cart.setStatus(CartStatus.CHECKED_OUT));
            cartRepository.saveAll(activeCarts.subList(1, activeCarts.size()));
        }

        return activeCart;
    }

    private void validateStock(Long productId, Integer requestedQuantity) {
        Product product = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .product(product)
                        .quantityAvailable(50)
                        .reservedQuantity(0)
                        .build()));

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
