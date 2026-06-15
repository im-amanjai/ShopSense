package shopsense.inventory;

public record InventoryResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantityAvailable,
        Integer reservedQuantity
) {
}