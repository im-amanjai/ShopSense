package shopsense.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopsense.product.Product;
import shopsense.product.ProductRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SemanticSearchService {

    private final ProductRepository productRepository;
    private final HuggingFaceEmbeddingService embeddingService;

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

    @Transactional
    public boolean generateEmbeddingForProduct(Product product) {
        if (product == null || !Boolean.TRUE.equals(product.getActive())) {
            return false;
        }

        List<Double> embedding = embeddingService.embed(buildProductText(product));

        if (embedding.isEmpty()) {
            return false;
        }

        product.setEmbeddingJson(embeddingService.toJson(embedding));
        productRepository.save(product);

        return true;
    }

    public List<SemanticSearchResponse> search(SemanticSearchRequest request) {
        List<Double> queryEmbedding = embeddingService.embed(request.query());
        List<Product> activeProducts = productRepository.findAll()
                .stream()
                .filter(product -> Boolean.TRUE.equals(product.getActive()))
                .toList();

        if (queryEmbedding.isEmpty()) {
            return keywordSearch(request.query(), activeProducts);
        }

        List<SemanticSearchResponse> embeddingResults = activeProducts
                .stream()
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

        if (embeddingResults.isEmpty()) {
            return keywordSearch(request.query(), activeProducts);
        }

        return embeddingResults;
    }

    private List<SemanticSearchResponse> keywordSearch(String query, List<Product> products) {
        return products.stream()
                .map(product -> new ProductSimilarity(product, keywordScore(query, product)))
                .filter(result -> result.similarity() > 0)
                .sorted(Comparator.comparing(ProductSimilarity::similarity).reversed())
                .limit(10)
                .map(result -> toResponse(result.product(), result.similarity()))
                .toList();
    }

    private double keywordScore(String query, Product product) {
        if (query == null || query.isBlank()) {
            return 0.5;
        }

        String text = buildProductText(product).toLowerCase(Locale.ROOT);
        String[] terms = query.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        double score = 0.0;

        for (String term : terms) {
            if (term.length() < 2) {
                continue;
            }

            if (product.getName() != null && product.getName().toLowerCase(Locale.ROOT).contains(term)) {
                score += 0.35;
            } else if (text.contains(term)) {
                score += 0.15;
            }
        }

        return Math.min(score, 0.95);
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
