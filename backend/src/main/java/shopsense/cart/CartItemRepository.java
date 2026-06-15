package shopsense.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import shopsense.product.Product;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}