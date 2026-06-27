package shopsense.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shopsense.product.Product;
import shopsense.product.ProductRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryResponse upsert(Long productId, InventoryRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseGet(() -> Inventory.builder()
                        .product(product)
                        .reservedQuantity(0)
                        .build());

        inventory.setQuantityAvailable(request.quantityAvailable());

        Inventory savedInventory = inventoryRepository.save(inventory);

        return toResponse(savedInventory);
    }

    public InventoryResponse findByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found"));

        return toResponse(inventory);
    }

    @Transactional
    public List<InventoryResponse> findAll() {
        productRepository.findByActiveTrue().forEach(product ->
                inventoryRepository.findByProductId(product.getId())
                        .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                                .product(product)
                                .quantityAvailable(50)
                                .reservedQuantity(0)
                                .build()))
        );

        return inventoryRepository.findAll()
                .stream()
                .filter(inventory -> Boolean.TRUE.equals(inventory.getProduct().getActive()))
                .map(this::toResponse)
                .toList();
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return new InventoryResponse(
                inventory.getId(),
                inventory.getProduct().getId(),
                inventory.getProduct().getName(),
                inventory.getQuantityAvailable(),
                inventory.getReservedQuantity()
        );
    }
}
