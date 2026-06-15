package shopsense.review;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopsense.product.Product;
import shopsense.product.ProductRepository;
import shopsense.user.User;
import shopsense.user.UserRepository;
import shopsense.recommendation.RecommendationService;
import shopsense.recommendation.UserEventType;
import shopsense.ai.OllamaReviewAnalysisService;
import shopsense.ai.ReviewAiAnalysis;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final OllamaReviewAnalysisService ollamaReviewAnalysisService;

    @Transactional
    public ReviewResponse createReview(String email, Long productId, ReviewRequest request) {
        User user = findUser(email);

        Product product = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (reviewRepository.existsByUserAndProduct(user, product)) {
            throw new IllegalArgumentException("You have already reviewed this product");
        }
        ReviewAiAnalysis aiAnalysis = ollamaReviewAnalysisService.analyzeReview(
                request.rating(),
                request.comment()
        );

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .sentiment(aiAnalysis.sentiment())
                .moderationStatus(aiAnalysis.suggestedStatus())
                .aiConfidence(aiAnalysis.confidence())
                .moderationReason(aiAnalysis.reason())
                .build();

        Review savedReview = reviewRepository.save(review);
        recommendationService.trackEvent(email, product.getId(), UserEventType.REVIEW);

        return toResponse(savedReview);
    }

    public List<ReviewResponse> findApprovedReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return reviewRepository
                .findByProductAndModerationStatusOrderByCreatedAtDesc(product, ModerationStatus.APPROVED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReviewResponse> findPendingReviews() {
        return reviewRepository
                .findByModerationStatusOrderByCreatedAtDesc(ModerationStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReviewResponse moderateReview(Long reviewId, ReviewModerationRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        review.setModerationStatus(request.moderationStatus());

        Review savedReview = reviewRepository.save(review);

        recalculateAverageRating(savedReview.getProduct());

        return toResponse(savedReview);
    }

    private void recalculateAverageRating(Product product) {
        List<Review> approvedReviews = reviewRepository
                .findByProductAndModerationStatus(product, ModerationStatus.APPROVED);

        if (approvedReviews.isEmpty()) {
            product.setAverageRating(0.0);
        } else {
            double average = approvedReviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);

            product.setAverageRating(average);
        }

        productRepository.save(product);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getProduct().getName(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getSentiment(),
                review.getModerationStatus(),
                review.getAiConfidence(),
                review.getModerationReason(),
                review.getCreatedAt()
        );
    }
}