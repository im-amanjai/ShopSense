package shopsense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import shopsense.review.ModerationStatus;
import shopsense.review.ReviewSentiment;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiReviewAnalysisService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.base-url}")
    private String baseUrl;

    @Value("${gemini.chat-model}")
    private String model;

    public ReviewAiAnalysis analyzeReview(Integer rating, String comment) {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackAnalysis("Gemini is not configured, defaulted to manual review");
        }

        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            String prompt = """
                    You are a review moderation assistant for an e-commerce app.

                    Analyze this product review and return ONLY valid JSON.

                    JSON format:
                    {
                      "sentiment": "POSITIVE | NEUTRAL | NEGATIVE | TOXIC | SPAM",
                      "suggestedStatus": "APPROVED | PENDING | REJECTED",
                      "confidence": 0.0,
                      "reason": "short reason"
                    }

                    Rules:
                    - Spam, scams, promotional links, or unrelated reviews: sentiment SPAM and suggestedStatus REJECTED.
                    - Hate, abuse, threats, or profanity: sentiment TOXIC and suggestedStatus REJECTED.
                    - Honest negative product feedback: NEGATIVE and PENDING.
                    - Normal positive/neutral reviews: POSITIVE or NEUTRAL and PENDING.
                    - confidence must be between 0 and 1.

                    Rating: %d
                    Review: %s
                    """.formatted(rating, comment == null ? "" : comment);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    )),
                    "generationConfig", Map.of(
                            "temperature", 0.1,
                            "responseMimeType", "application/json"
                    )
            );

            String response = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .queryParam("key", apiKey)
                            .build(model))
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseGeminiResponse(response);
        } catch (Exception ex) {
            return fallbackAnalysis("Gemini unavailable, defaulted to manual review");
        }
    }

    private ReviewAiAnalysis parseGeminiResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        String aiText = root.path("candidates")
                .path(0)
                .path("content")
                .path("parts")
                .path(0)
                .path("text")
                .asText();

        JsonNode result = objectMapper.readTree(extractJson(aiText));

        return new ReviewAiAnalysis(
                ReviewSentiment.valueOf(result.path("sentiment").asText("NEUTRAL")),
                ModerationStatus.valueOf(result.path("suggestedStatus").asText("PENDING")),
                result.path("confidence").asDouble(0.5),
                result.path("reason").asText("Gemini analysis completed")
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
                  "sentiment": "NEUTRAL",
                  "suggestedStatus": "PENDING",
                  "confidence": 0.0,
                  "reason": "Could not parse AI response"
                }
                """;
    }

    private ReviewAiAnalysis fallbackAnalysis(String reason) {
        return new ReviewAiAnalysis(
                ReviewSentiment.NEUTRAL,
                ModerationStatus.PENDING,
                0.0,
                reason
        );
    }
}
