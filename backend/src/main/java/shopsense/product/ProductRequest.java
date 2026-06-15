package shopsense.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "Product name is required")
        String name,

        @NotBlank(message = "Product slug is required")
        String slug,

        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", message = "Price must be positive")
        BigDecimal price,

        String brand,

        String imageUrl,

        @NotNull(message = "Category id is required")
        Long categoryId
) {
}