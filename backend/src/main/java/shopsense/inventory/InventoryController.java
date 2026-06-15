package shopsense.inventory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryResponse> findAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/{productId}")
    public InventoryResponse findByProductId(@PathVariable Long productId) {
        return inventoryService.findByProductId(productId);
    }

    @PutMapping("/{productId}")
    public InventoryResponse upsert(
            @PathVariable Long productId,
            @Valid @RequestBody InventoryRequest request
    ) {
        return inventoryService.upsert(productId, request);
    }
}