package shopsense.recommendation;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import shopsense.product.Product;
import shopsense.user.User;

import java.util.List;

public interface UserEventRepository extends JpaRepository<UserEvent, Long> {

    @Query("""
        select e.product.category.id, sum(e.score)
        from UserEvent e
        where e.user = :user
        group by e.product.category.id
        order by sum(e.score) desc
    """)
    List<Object[]> findCategoryScoresByUser(User user);

    @Query("""
        select e.product.id
        from UserEvent e
        where e.user = :user and e.eventType = 'PURCHASE'
    """)
    List<Long> findPurchasedProductIds(User user);

    @Query("""
        select e.product.id, sum(e.score)
        from UserEvent e
        group by e.product.id
        order by sum(e.score) desc
    """)
    List<Object[]> findPopularProductScores(Pageable pageable);

    List<UserEvent> findByUserAndProduct(User user, Product product);
}