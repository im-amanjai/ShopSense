package shopsense.review;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/products/{productId}/reviews")
    public ReviewResponse createReview(
            Authentication authentication,
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request
    ) {
        return reviewService.createReview(authentication.getName(), productId, request);
    }

    @GetMapping("/api/products/{productId}/reviews")
    public List<ReviewResponse> findApprovedReviews(@PathVariable Long productId) {
        return reviewService.findApprovedReviews(productId);
    }

    @GetMapping("/api/admin/reviews/pending")
    public List<ReviewResponse> findPendingReviews() {
        return reviewService.findPendingReviews();
    }

    @PatchMapping("/api/admin/reviews/{reviewId}/moderation")
    public ReviewResponse moderateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewModerationRequest request
    ) {
        return reviewService.moderateReview(reviewId, request);
    }
}