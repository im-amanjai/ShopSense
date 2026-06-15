package shopsense.ai;

import shopsense.review.ModerationStatus;
import shopsense.review.ReviewSentiment;

public record ReviewAiAnalysis(
        ReviewSentiment sentiment,
        ModerationStatus suggestedStatus,
        Double confidence,
        String reason
) {
}