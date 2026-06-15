package shopsense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OllamaEmbeddingService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ollama.embedding-url}")
    private String embeddingUrl;

    @Value("${ollama.embedding-model}")
    private String embeddingModel;

    public List<Double> embed(String text) {
        try {
            RestClient restClient = RestClient.builder()
                    .baseUrl(embeddingUrl)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "model", embeddingModel,
                    "prompt", text
            );

            String response = restClient.post()
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            JsonNode embeddingNode = root.path("embedding");

            List<Double> embedding = new ArrayList<>();

            if (embeddingNode.isArray()) {
                for (JsonNode node : embeddingNode) {
                    embedding.add(node.asDouble());
                }
            }

            return embedding;
        } catch (Exception ex) {
            return List.of();
        }
    }

    public String toJson(List<Double> embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (Exception ex) {
            return "[]";
        }
    }

    public List<Double> fromJson(String json) {
        try {
            if (json == null || json.isBlank()) {
                return List.of();
            }

            JsonNode root = objectMapper.readTree(json);
            List<Double> embedding = new ArrayList<>();

            if (root.isArray()) {
                for (JsonNode node : root) {
                    embedding.add(node.asDouble());
                }
            }

            return embedding;
        } catch (Exception ex) {
            return List.of();
        }
    }
}