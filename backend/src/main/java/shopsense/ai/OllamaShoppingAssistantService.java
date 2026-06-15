package shopsense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import shopsense.product.Product;
import shopsense.product.ProductRepository;
import shopsense.recommendation.RecommendationService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OllamaShoppingAssistantService {

    private final ProductRepository productRepository;
    private final RecommendationService recommendationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    public ShoppingAssistantResponse ask(String email, ShoppingAssistantRequest request) {
        List<Product> products = productRepository.findTop50ByActiveTrueOrderByAverageRatingDesc();
        if (products.isEmpty()) {
            return new ShoppingAssistantResponse(
                    "I could not find any active products in the catalog yet.",
                    List.of()
            );
        }

        try {
            String prompt = buildPrompt(request.message(), products);

            RestClient restClient = RestClient.builder()
                    .baseUrl(ollamaUrl)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "prompt", prompt,
                    "stream", false
            );

            String response = restClient.post()
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseResponse(response, products);
        } catch (Exception ex) {
            return fallbackResponse(request.message(), products);
        }
    }

    private String buildPrompt(String userMessage, List<Product> products) {
        StringBuilder catalog = new StringBuilder();

        for (Product product : products) {
            catalog.append("ID: ").append(product.getId()).append("\n");
            catalog.append("Name: ").append(product.getName()).append("\n");
            catalog.append("Brand: ").append(product.getBrand()).append("\n");
            catalog.append("Category: ").append(product.getCategory().getName()).append("\n");
            catalog.append("Price: ").append(product.getPrice()).append("\n");
            catalog.append("Rating: ").append(product.getAverageRating()).append("\n");
            catalog.append("Description: ").append(product.getDescription()).append("\n");
            catalog.append("---\n");
        }

        return """
                You are an AI shopping assistant for an e-commerce app.

                You must recommend products ONLY from the product catalog below.
                Do not invent products.
                Use product IDs exactly as given.
                If an exact match is not available, recommend the closest matching products from the catalog. Only return empty recommendedProductIds if the catalog has no remotely relevant products.

                Return ONLY valid JSON.
                Do not include markdown or explanation outside JSON.

                JSON format:
                {
                  "answer": "short helpful answer",
                  "recommendedProductIds": [1, 2, 3],
                  "reasons": {
                    "1": "reason for product 1",
                    "2": "reason for product 2"
                  }
                }

                User question:
                %s

                Product catalog:
                %s
                """.formatted(userMessage, catalog);
    }

    private ShoppingAssistantResponse parseResponse(String response, List<Product> products) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        String aiText = root.path("response").asText();

        String json = extractJson(aiText);
        JsonNode result = objectMapper.readTree(json);

        String answer = result.path("answer").asText("Here are some products you may like.");

        List<ShoppingAssistantProductResponse> recommendedProducts = new ArrayList<>();

        JsonNode ids = result.path("recommendedProductIds");

        if (ids.isArray()) {
            for (JsonNode idNode : ids) {
                Long productId = idNode.asLong();

                products.stream()
                        .filter(product -> product.getId().equals(productId))
                        .findFirst()
                        .ifPresent(product -> {
                            String reason = result.path("reasons")
                                    .path(String.valueOf(product.getId()))
                                    .asText("Recommended based on your request.");

                            recommendedProducts.add(toProductResponse(product, reason));
                        });
            }
        }

        return new ShoppingAssistantResponse(answer, recommendedProducts);
    }

    private ShoppingAssistantResponse fallbackResponse(String message, List<Product> products) {
        String lowerMessage = message.toLowerCase();

        List<Product> matched = products.stream()
                .filter(product ->
                        contains(product.getName(), lowerMessage)
                                || contains(product.getBrand(), lowerMessage)
                                || contains(product.getDescription(), lowerMessage)
                                || contains(product.getCategory().getName(), lowerMessage)
                )
                .limit(5)
                .toList();

        if (matched.isEmpty()) {
            matched = products.stream().limit(5).toList();
        }

        List<ShoppingAssistantProductResponse> productResponses = matched.stream()
                .map(product -> toProductResponse(product, "Recommended from available catalog."))
                .toList();

        return new ShoppingAssistantResponse(
                "Ollama is unavailable, so I selected products using basic catalog matching.",
                productResponses
        );
    }

    private boolean contains(String value, String query) {
        if (value == null || query == null) {
            return false;
        }

        String[] words = value.toLowerCase().split("\\s+");

        for (String word : words) {
            if (word.length() > 2 && query.contains(word)) {
                return true;
            }
        }

        return false;
    }

    private ShoppingAssistantProductResponse toProductResponse(Product product, String reason) {
        return new ShoppingAssistantProductResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getPrice(),
                product.getAverageRating(),
                reason
        );
    }

    private String extractJson(String text) {
        int start = text.indexOf("{");
        int end = text.lastIndexOf("}");

        if (start >= 0 && end > start) {
            return text.substring(start, end + 1);
        }

        return """
                {
                  "answer": "I could not parse the AI response.",
                  "recommendedProductIds": [],
                  "reasons": {}
                }
                """;
    }
}