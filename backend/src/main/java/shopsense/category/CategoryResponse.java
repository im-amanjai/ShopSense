package shopsense.category;

public record CategoryResponse(
        Long id,
        String name,
        String slug,
        String description
) {
}