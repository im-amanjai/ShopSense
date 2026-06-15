package shopsense.product;

import jakarta.persistence.*;
import lombok.*;
import shopsense.category.Category;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 3000)
    private String description;

    @Column(length = 20000)
    private String embeddingJson;

    @Column(nullable = false)
    private BigDecimal price;

    private String brand;

    private String imageUrl;

    private Double averageRating;

    private Boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        active = active == null ? true : active;
        averageRating = averageRating == null ? 0.0 : averageRating;
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}