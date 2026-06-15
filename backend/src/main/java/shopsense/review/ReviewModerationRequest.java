package shopsense.review;

import jakarta.validation.constraints.NotNull;

public record ReviewModerationRequest(
        @NotNull(message = "Moderation status is required")
        ModerationStatus moderationStatus
) {
}