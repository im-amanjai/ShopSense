package shopsense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import shopsense.review.ModerationStatus;
import shopsense.review.ReviewSentiment;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class OllamaReviewAnalysisService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ollama.url}")
    private String ollamaUrl;

    @Value("${ollama.model}")
    private String model;

    public ReviewAiAnalysis analyzeReview(Integer rating, String comment) {
        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(ollamaUrl)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            String prompt = """
                    You are a review moderation assistant for an e-commerce app.

                    Analyze this product review and return ONLY valid JSON.
                    Do not include markdown. Do not include explanation outside JSON.

                    JSON format:
                    {
                      "sentiment": "POSITIVE | NEUTRAL | NEGATIVE | TOXIC | SPAM",
                      "suggestedStatus": "APPROVED | PENDING | REJECTED",
                      "confidence": 0.0,
                      "reason": "short reason"
                    }

                    Rules:
                    - If review is spam, scam, promotional link, or unrelated: sentiment SPAM and suggestedStatus REJECTED.
                    - If review contains hate, abuse, threats, or profanity: sentiment TOXIC and suggestedStatus REJECTED.
                    - Honest negative product feedback should be NEGATIVE and PENDING, not rejected.
                    - Normal positive/neutral reviews should be POSITIVE or NEUTRAL and PENDING.
                    - confidence must be between 0 and 1.

                    Rating: %d
                    Review: %s
                    """.formatted(rating, comment == null ? "" : comment);

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "prompt", prompt,
                    "stream", false
            );

            String response = restClient.post()
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseOllamaResponse(response);
        } catch (Exception ex) {
            return fallbackAnalysis();
        }
    }

    private ReviewAiAnalysis parseOllamaResponse(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);

        String aiText = root.path("response").asText();

        String cleanedJson = extractJson(aiText);

        JsonNode result = objectMapper.readTree(cleanedJson);

        return new ReviewAiAnalysis(
                ReviewSentiment.valueOf(result.path("sentiment").asText("NEUTRAL")),
                ModerationStatus.valueOf(result.path("suggestedStatus").asText("PENDING")),
                result.path("confidence").asDouble(0.5),
                result.path("reason").asText("AI analysis completed")
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

    private ReviewAiAnalysis fallbackAnalysis() {
        return new ReviewAiAnalysis(
                ReviewSentiment.NEUTRAL,
                ModerationStatus.PENDING,
                0.0,
                "Ollama unavailable, defaulted to manual review"
        );
    }
}