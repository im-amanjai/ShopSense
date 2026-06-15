package shopsense.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopsense.product.Product;
import shopsense.product.ProductRepository;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SemanticSearchService {

    private final ProductRepository productRepository;
    private final OllamaEmbeddingService embeddingService;

    @Transactional
    public String generateEmbeddingsForAllProducts() {
        List<Product> products = productRepository.findAll()
                .stream()
                .filter(Product::getActive)
                .toList();

        int updated = 0;

        for (Product product : products) {
            String text = buildProductText(product);
            List<Double> embedding = embeddingService.embed(text);

            if (!embedding.isEmpty()) {
                product.setEmbeddingJson(embeddingService.toJson(embedding));
                productRepository.save(product);
                updated++;
            }
        }

        return "Generated embeddings for " + updated + " products";
    }

    public List<SemanticSearchResponse> search(SemanticSearchRequest request) {
        List<Double> queryEmbedding = embeddingService.embed(request.query());

        if (queryEmbedding.isEmpty()) {
            return List.of();
        }

        return productRepository.findAll()
                .stream()
                .filter(Product::getActive)
                .map(product -> {
                    List<Double> productEmbedding = embeddingService.fromJson(product.getEmbeddingJson());
                    double similarity = cosineSimilarity(queryEmbedding, productEmbedding);

                    return new ProductSimilarity(product, similarity);
                })
                .filter(result -> result.similarity() > 0)
                .sorted(Comparator.comparing(ProductSimilarity::similarity).reversed())
                .limit(10)
                .map(result -> toResponse(result.product(), result.similarity()))
                .toList();
    }

    private String buildProductText(Product product) {
        return """
                Product name: %s
                Brand: %s
                Category: %s
                Price: %s
                Rating: %s
                Description: %s
                """.formatted(
                product.getName(),
                product.getBrand(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getAverageRating(),
                product.getDescription()
        );
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        if (a.isEmpty() || b.isEmpty() || a.size() != b.size()) {
            return 0.0;
        }

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private SemanticSearchResponse toResponse(Product product, double similarity) {
        return new SemanticSearchResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getAverageRating(),
                similarity
        );
    }

    private record ProductSimilarity(Product product, double similarity) {
    }
}