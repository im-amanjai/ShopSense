package shopsense.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import shopsense.category.Category;
import shopsense.category.CategoryRepository;
import shopsense.inventory.Inventory;
import shopsense.inventory.InventoryRepository;
import shopsense.product.Product;
import shopsense.product.ProductRepository;
import shopsense.user.Role;
import shopsense.user.User;
import shopsense.user.UserRepository;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Value("${shopsense.admin.email:}")
    private String adminEmail;

    @Value("${shopsense.admin.password:}")
    private String adminPassword;

    @Value("${shopsense.admin.name:Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        seedAdminUser();

        Category audio = upsertCategory("Audio", "audio", "Headphones, speakers, and everyday sound gear.");
        Category gaming = upsertCategory("Gaming", "gaming", "Gaming accessories and performance gear.");
        Category electronics = upsertCategory("Electronics", "electronics", "Smart watches, gadgets, and daily technology.");
        Category fashion = upsertCategory("Fashion", "fashion", "Shoes, clothing, and useful lifestyle essentials.");

        upsertFrontendProduct(
                "Sony WH-CH720N",
                "sony-wh-ch720n",
                "Lightweight wireless headphones with noise cancellation, long battery life, and clear voice calls.",
                new BigDecimal("4999.00"),
                "Sony",
                "frontend:headphones",
                4.5,
                audio,
                50
        );

        upsertFrontendProduct(
                "RGB Precision Gaming Mouse",
                "rgb-precision-gaming-mouse",
                "Ergonomic gaming mouse with responsive tracking, comfortable grip, and smooth everyday gaming performance.",
                new BigDecimal("1299.00"),
                "HyperPlay",
                "frontend:gamingmouse",
                4.3,
                gaming,
                50
        );

        upsertFrontendProduct(
                "FitPulse AMOLED Smart Watch",
                "fitpulse-amoled-smart-watch",
                "AMOLED smartwatch with health tracking, workout modes, notifications, and multi-day battery life.",
                new BigDecimal("2999.00"),
                "FitPulse",
                "frontend:smartwatch",
                4.5,
                electronics,
                50
        );

        upsertFrontendProduct(
                "AeroRun Daily Running Shoes",
                "aerorun-daily-running-shoes",
                "Breathable running shoes with cushioned support for daily walks, workouts, and travel.",
                new BigDecimal("3499.00"),
                "AeroRun",
                "frontend:runningshoes",
                4.3,
                fashion,
                50
        );

        upsertFrontendProduct(
                "Boom Mini Bluetooth Speaker",
                "boom-mini-bluetooth-speaker",
                "Compact Bluetooth speaker with punchy sound, water resistance, and an easy carry design.",
                new BigDecimal("1899.00"),
                "Boom",
                "frontend:bluetoothspeaker",
                4.2,
                audio,
                50
        );
    }

    private void seedAdminUser() {
        boolean hasEmail = StringUtils.hasText(adminEmail);
        boolean hasPassword = StringUtils.hasText(adminPassword);

        if (!hasEmail && !hasPassword) {
            return;
        }

        if (!hasEmail || !hasPassword) {
            throw new IllegalStateException("Both shopsense.admin.email and shopsense.admin.password must be configured to seed an admin user.");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> User.builder()
                        .email(adminEmail)
                        .build());

        admin.setName(StringUtils.hasText(adminName) ? adminName : "Admin");
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);

        userRepository.save(admin);
    }

    private Category upsertCategory(String name, String slug, String description) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseGet(() -> Category.builder().slug(slug).build());

        category.setName(name);
        category.setDescription(description);

        return categoryRepository.save(category);
    }

    private void upsertFrontendProduct(
            String name,
            String slug,
            String description,
            BigDecimal price,
            String brand,
            String imageUrl,
            Double averageRating,
            Category category,
            Integer quantityAvailable
    ) {
        Product product = productRepository.findBySlug(slug)
                .orElseGet(Product::new);

        product.setName(name);
        product.setSlug(slug);
        product.setDescription(description);
        product.setPrice(price);
        product.setBrand(brand);
        product.setImageUrl(imageUrl);
        product.setAverageRating(averageRating);
        product.setCategory(category);
        product.setActive(true);

        Product savedProduct = productRepository.save(product);

        Inventory inventory = inventoryRepository.findByProductId(savedProduct.getId())
                .orElseGet(() -> Inventory.builder()
                        .product(savedProduct)
                        .reservedQuantity(0)
                        .build());

        inventory.setQuantityAvailable(quantityAvailable);
        inventoryRepository.save(inventory);
    }
}
