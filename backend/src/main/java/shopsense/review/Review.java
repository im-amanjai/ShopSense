package shopsense.review;

import jakarta.persistence.*;
import lombok.*;
import shopsense.product.Product;
import shopsense.user.User;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "product_id"})
        }
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double aiConfidence;

    @Column(length = 1000)
    private String moderationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 2000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewSentiment sentiment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ModerationStatus moderationStatus;

    private Instant createdAt;

    @PrePersist
    void onCreate() {
        sentiment = sentiment == null ? ReviewSentiment.NEUTRAL : sentiment;
        moderationStatus = moderationStatus == null ? ModerationStatus.PENDING : moderationStatus;
        createdAt = Instant.now();
    }
}