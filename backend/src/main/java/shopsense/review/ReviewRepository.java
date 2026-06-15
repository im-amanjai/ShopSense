package shopsense.review;

import org.springframework.data.jpa.repository.JpaRepository;
import shopsense.product.Product;
import shopsense.user.User;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByUserAndProduct(User user, Product product);

    List<Review> findByProductAndModerationStatusOrderByCreatedAtDesc(
            Product product,
            ModerationStatus moderationStatus
    );

    List<Review> findByModerationStatusOrderByCreatedAtDesc(
            ModerationStatus moderationStatus
    );

    List<Review> findByProductAndModerationStatus(Product product, ModerationStatus moderationStatus);
}