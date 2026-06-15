package shopsense.ai;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final OllamaShoppingAssistantService shoppingAssistantService;
    private final SemanticSearchService semanticSearchService;

    @PostMapping("/shopping-assistant")
    public ShoppingAssistantResponse shoppingAssistant(
            Authentication authentication,
            @Valid @RequestBody ShoppingAssistantRequest request
    ) {
        return shoppingAssistantService.ask(authentication.getName(), request);
    }
    @PostMapping("/semantic-search")
    public List<SemanticSearchResponse> semanticSearch(
            @Valid @RequestBody SemanticSearchRequest request
    ) {
        return semanticSearchService.search(request);
    }

    @PostMapping("/admin/products/generate-embeddings")
    public String generateProductEmbeddings() {
        return semanticSearchService.generateEmbeddingsForAllProducts();
    }
}