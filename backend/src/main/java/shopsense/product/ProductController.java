package shopsense.product;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import shopsense.recommendation.RecommendationService;
import shopsense.recommendation.UserEventType;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final RecommendationService recommendationService;

    @GetMapping("/api/products")
    public Page<ProductResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable
    ) {
        return productService.search(query, category, brand, minPrice, maxPrice, pageable);
    }

    @GetMapping("/api/products/{id}")
    public ProductResponse findById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication != null && authentication.isAuthenticated()) {
            recommendationService.trackEvent(authentication.getName(), id, UserEventType.VIEW);
        }

        return productService.findById(id);
    }

    @PostMapping("/api/admin/products")
    public ProductResponse create(@Valid @RequestBody ProductRequest request) {
        return productService.create(request);
    }
    @PutMapping("/api/admin/products/{id}")
    public ProductResponse update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        return productService.update(id, request);
    }

    @DeleteMapping("/api/admin/products/{id}")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}