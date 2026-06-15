package shopsense.ai;

import jakarta.validation.constraints.NotBlank;

public record ShoppingAssistantRequest(
        @NotBlank(message = "Message is required")
        String message
) {
}