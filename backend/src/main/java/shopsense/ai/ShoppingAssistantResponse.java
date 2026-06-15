package shopsense.ai;

import java.util.List;

public record ShoppingAssistantResponse(
        String answer,
        List<ShoppingAssistantProductResponse> recommendedProducts
) {
}