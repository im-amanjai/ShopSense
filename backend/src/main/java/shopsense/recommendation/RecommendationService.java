package shopsense.recommendation;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import shopsense.product.Product;
import shopsense.product.ProductRepository;
import shopsense.user.User;
import shopsense.user.UserRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserEventRepository userEventRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public void trackEvent(String email, Long productId, UserEventType eventType) {
        if (email == null || productId == null || eventType == null) {
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        Product product = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElse(null);

        if (user == null || product == null) {
            return;
        }

        UserEvent event = UserEvent.builder()
                .user(user)
                .product(product)
                .eventType(eventType)
                .score(scoreFor(eventType))
                .build();

        userEventRepository.save(event);
    }

    public List<RecommendationResponse> recommendForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Object[]> categoryScores = userEventRepository.findCategoryScoresByUser(user);
        List<Long> purchasedProductIds = userEventRepository.findPurchasedProductIds(user);

        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (Object[] row : categoryScores) {
            Long categoryId = (Long) row[0];
            Number categoryScore = (Number) row[1];

            List<Product> products = productRepository.findAll()
                    .stream()
                    .filter(Product::getActive)
                    .filter(product -> product.getCategory().getId().equals(categoryId))
                    .filter(product -> !purchasedProductIds.contains(product.getId()))
                    .toList();

            for (Product product : products) {
                double score = categoryScore.doubleValue() + product.getAverageRating();

                recommendations.add(toResponse(
                        product,
                        "Because you interacted with " + product.getCategory().getName(),
                        score
                ));
            }
        }

        if (recommendations.isEmpty()) {
            return popularProducts();
        }

        return recommendations.stream()
                .sorted(Comparator.comparing(RecommendationResponse::score).reversed())
                .limit(10)
                .toList();
    }

    public List<RecommendationResponse> popularProducts() {
        List<Object[]> popularScores = userEventRepository.findPopularProductScores(PageRequest.of(0, 10));

        List<RecommendationResponse> popular = new ArrayList<>();

        for (Object[] row : popularScores) {
            Long productId = (Long) row[0];
            Number score = (Number) row[1];

            productRepository.findById(productId)
                    .filter(Product::getActive)
                    .ifPresent(product -> popular.add(
                            toResponse(product, "Popular with shoppers", score.doubleValue())
                    ));
        }

        if (popular.isEmpty()) {
            return productRepository.findAll()
                    .stream()
                    .filter(Product::getActive)
                    .sorted(Comparator.comparing(Product::getAverageRating).reversed())
                    .limit(10)
                    .map(product -> toResponse(product, "Top rated product", product.getAverageRating()))
                    .toList();
        }

        return popular;
    }

    public List<RecommendationResponse> similarProducts(Long productId) {
        Product sourceProduct = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return productRepository.findAll()
                .stream()
                .filter(Product::getActive)
                .filter(product -> !product.getId().equals(sourceProduct.getId()))
                .filter(product -> product.getCategory().getId().equals(sourceProduct.getCategory().getId()))
                .map(product -> {
                    double score = product.getAverageRating();

                    if (sourceProduct.getBrand() != null &&
                            sourceProduct.getBrand().equalsIgnoreCase(product.getBrand())) {
                        score += 2.0;
                    }

                    return toResponse(product, "Similar to " + sourceProduct.getName(), score);
                })
                .sorted(Comparator.comparing(RecommendationResponse::score).reversed())
                .limit(10)
                .toList();
    }

    private int scoreFor(UserEventType eventType) {
        return switch (eventType) {
            case VIEW -> 1;
            case ADD_TO_CART -> 3;
            case PURCHASE -> 5;
            case REVIEW -> 4;
        };
    }

    private RecommendationResponse toResponse(Product product, String reason, Double score) {
        return new RecommendationResponse(
                product.getId(),
                product.getName(),
                product.getBrand(),
                product.getCategory().getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getAverageRating(),
                reason,
                score
        );
    }
}