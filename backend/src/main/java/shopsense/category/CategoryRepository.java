package shopsense.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);

    @Query("""
        select distinct c from Category c
        join Product p on p.category = c
        where p.active = true
        order by c.name
    """)
    List<Category> findAllWithActiveProducts();
}
