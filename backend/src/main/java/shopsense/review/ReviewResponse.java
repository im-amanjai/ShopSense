package shopsense.review;

import java.time.Instant;

public record ReviewResponse(
        Long id,
        Long productId,
        String productName,
        Long userId,
        String userName,
        Integer rating,
        String comment,
        ReviewSentiment sentiment,
        ModerationStatus moderationStatus,
        Double aiConfidence,
        String moderationReason,
        Instant createdAt
) {
}