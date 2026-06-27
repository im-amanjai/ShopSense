package shopsense.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HuggingFaceEmbeddingService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api-key:}")
    private String apiKey;

    @Value("${huggingface.embedding-url}")
    private String embeddingUrl;

    public List<Double> embed(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        try {
            RestClient.Builder builder = RestClient.builder()
                    .baseUrl(embeddingUrl)
                    .defaultHeader("Content-Type", "application/json");

            if (apiKey != null && !apiKey.isBlank()) {
                builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey);
            }

            String response = builder.build()
                    .post()
                    .body(Map.of("inputs", text))
                    .retrieve()
                    .body(String.class);

            return parseEmbedding(response);
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

            return parseEmbedding(json);
        } catch (Exception ex) {
            return List.of();
        }
    }

    private List<Double> parseEmbedding(String json) throws Exception {
        JsonNode values = objectMapper.readTree(json);

        while (values.isArray() && values.size() > 0 && values.get(0).isArray()) {
            values = values.get(0);
        }

        List<Double> embedding = new ArrayList<>();
        if (values.isArray()) {
            for (JsonNode node : values) {
                embedding.add(node.asDouble());
            }
        }

        return embedding;
    }
}
