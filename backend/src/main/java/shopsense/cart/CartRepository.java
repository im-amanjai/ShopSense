package shopsense.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import shopsense.user.User;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUserAndStatus(User user, CartStatus status);

    List<Cart> findAllByUserAndStatusOrderByUpdatedAtDesc(User user, CartStatus status);
}
