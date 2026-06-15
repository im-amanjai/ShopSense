package shopsense.inventory;

import jakarta.persistence.*;
import lombok.*;
import shopsense.product.Product;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false)
    private Integer quantityAvailable;

    @Column(nullable = false)
    private Integer reservedQuantity;

    private Instant lastUpdated;

    @PrePersist
    void onCreate() {
        reservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        lastUpdated = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        lastUpdated = Instant.now();
    }
}