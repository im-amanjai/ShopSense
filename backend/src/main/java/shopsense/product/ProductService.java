package shopsense.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import shopsense.category.Category;
import shopsense.category.CategoryRepository;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Product slug already exists");
        }

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Product product = Product.builder()
                .name(request.name())
                .slug(request.slug())
                .description(request.description())
                .price(request.price())
                .brand(request.brand())
                .imageUrl(request.imageUrl())
                .category(category)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public ProductResponse findById(Long id) {
        Product product = productRepository.findById(id)
                .filter(Product::getActive)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return toResponse(product);
    }

    public Page<ProductResponse> search(
            String query,
            String categorySlug,
            String brand,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        return productRepository
                .search(query, categorySlug, brand, minPrice, maxPrice, pageable)
                .map(this::toResponse);
    }
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        product.setName(request.name());
        product.setSlug(request.slug());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setBrand(request.brand());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return toResponse(savedProduct);
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setActive(false);
        productRepository.save(product);
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getBrand(),
                product.getImageUrl(),
                product.getAverageRating(),
                product.getActive(),
                product.getCategory().getId(),
                product.getCategory().getName()
        );
    }
}