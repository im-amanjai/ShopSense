package shopsense.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySlug(String slug);

    Optional<Product> findBySlug(String slug);

    List<Product> findByActiveTrue();

    List<Product> findTop50ByActiveTrueOrderByAverageRatingDesc();

    @Query("""
        select p from Product p
        where p.active = true
        and (:query is null or lower(p.name) like concat('%', lower(cast(:query as string)), '%')
            or lower(p.description) like concat('%', lower(cast(:query as string)), '%'))
        and (:categorySlug is null or p.category.slug = :categorySlug)
        and (:brand is null or lower(p.brand) = lower(cast(:brand as string)))
        and (:minPrice is null or p.price >= :minPrice)
        and (:maxPrice is null or p.price <= :maxPrice)
    """)
    Page<Product> search(
            String query,
            String categorySlug,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
}
