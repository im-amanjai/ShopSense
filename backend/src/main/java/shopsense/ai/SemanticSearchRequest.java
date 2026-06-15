package shopsense.ai;

import jakarta.validation.constraints.NotBlank;

public record SemanticSearchRequest(
        @NotBlank(message = "Query is required")
        String query
) {
}