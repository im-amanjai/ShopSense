package shopsense.category;

import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
        @NotBlank(message = "Category name is required")
        String name,

        @NotBlank(message = "Category slug is required")
        String slug,

        String description
) {
}