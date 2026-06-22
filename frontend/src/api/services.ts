import headphones from "../assets/headphones.jpg";
import gamingmouse from "../assets/gamingmouse.jpg";
import smartwatch from "../assets/smartwatch.jpg";
import runningshoes from "../assets/runningshoes.jpg";
import bluetoothspeaker from "../assets/bluetoothspeaker.jpg";
import type {
  AuthRequest,
  AuthResponse,
  CartItemRequest,
  CartResponse,
  CategoryResponse,
  CurrentUserResponse,
  OrderResponse,
  PageResponse,
  PaymentRequest,
  PaymentResponse,
  ProductResponse,
  ProductSearchParams,
  RecommendationResponse,
  RegisterRequest,
  ReviewRequest,
  ReviewResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
  ShoppingAssistantRequest,
  ShoppingAssistantResponse,
} from "../types/api";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  mockUser: "shopsense_mock_user",
  cart: "shopsense_mock_cart",
  orders: "shopsense_mock_orders",
  reviews: "shopsense_mock_reviews",
};

const categories: CategoryResponse[] = [
  { id: 1, name: "Electronics", slug: "electronics", description: "Smart everyday tech." },
  { id: 2, name: "Gaming", slug: "gaming", description: "Gaming gear and accessories." },
  { id: 3, name: "Fashion", slug: "fashion", description: "Comfortable, useful essentials." },
  { id: 4, name: "Audio", slug: "audio", description: "Headphones, speakers, and sound gear." },
];

const products: ProductResponse[] = [
  {
    id: 1,
    name: "Sony WH-CH720N Wireless Headphones",
    slug: "sony-wh-ch720n-wireless-headphones",
    description: "Lightweight wireless headphones with noise cancellation, long battery life, and clear voice calls.",
    price: 4999,
    brand: "Sony",
    imageUrl: headphones,
    averageRating: 4.6,
    active: true,
    categoryId: 4,
    categoryName: "Audio",
  },
  {
    id: 2,
    name: "RGB Precision Gaming Mouse",
    slug: "rgb-precision-gaming-mouse",
    description: "Ergonomic gaming mouse with programmable buttons, smooth tracking, and adjustable DPI.",
    price: 1299,
    brand: "HyperPlay",
    imageUrl: gamingmouse,
    averageRating: 4.4,
    active: true,
    categoryId: 2,
    categoryName: "Gaming",
  },
  {
    id: 3,
    name: "FitPulse AMOLED Smart Watch",
    slug: "fitpulse-amoled-smart-watch",
    description: "AMOLED smartwatch with health tracking, workout modes, notifications, and multi-day battery life.",
    price: 2999,
    brand: "FitPulse",
    imageUrl: smartwatch,
    averageRating: 4.5,
    active: true,
    categoryId: 1,
    categoryName: "Electronics",
  },
  {
    id: 4,
    name: "AeroRun Daily Running Shoes",
    slug: "aerorun-daily-running-shoes",
    description: "Breathable running shoes with cushioned support for daily walks, workouts, and travel.",
    price: 3499,
    brand: "AeroRun",
    imageUrl: runningshoes,
    averageRating: 4.3,
    active: true,
    categoryId: 3,
    categoryName: "Fashion",
  },
  {
    id: 5,
    name: "Boom Mini Bluetooth Speaker",
    slug: "boom-mini-bluetooth-speaker",
    description: "Compact Bluetooth speaker with punchy sound, water resistance, and an easy carry design.",
    price: 1899,
    brand: "Boom",
    imageUrl: bluetoothspeaker,
    averageRating: 4.2,
    active: true,
    categoryId: 4,
    categoryName: "Audio",
  },
];

const defaultReviews: ReviewResponse[] = [
  {
    id: 1,
    productId: 1,
    productName: products[0].name,
    userId: 10,
    userName: "Aarav Mehta",
    rating: 5,
    comment: "Comfortable for long listening sessions and the battery life is excellent.",
    sentiment: "POSITIVE",
    moderationStatus: "APPROVED",
    aiConfidence: 0.96,
    moderationReason: "Helpful product feedback",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 2,
    productId: 2,
    productName: products[1].name,
    userId: 11,
    userName: "Neha Rao",
    rating: 4,
    comment: "Good grip and responsive buttons. Great value for gaming.",
    sentiment: "POSITIVE",
    moderationStatus: "APPROVED",
    aiConfidence: 0.92,
    moderationReason: "Helpful product feedback",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

function readJson<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function buildCart(items: CartResponse["items"]): CartResponse {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.lineTotal), 0);
  return {
    cartId: 1,
    items,
    totalAmount,
  };
}

function getCart() {
  return readJson<CartResponse>(STORAGE_KEYS.cart, buildCart([]));
}

function setCart(cart: CartResponse) {
  writeJson(STORAGE_KEYS.cart, cart);
  return cart;
}

function getOrders() {
  return readJson<OrderResponse[]>(STORAGE_KEYS.orders, []);
}

function setOrders(orders: OrderResponse[]) {
  writeJson(STORAGE_KEYS.orders, orders);
}

function getReviews() {
  return readJson<ReviewResponse[]>(STORAGE_KEYS.reviews, defaultReviews);
}

function setReviews(reviews: ReviewResponse[]) {
  writeJson(STORAGE_KEYS.reviews, reviews);
}

function currentUser(): CurrentUserResponse {
  return readJson<CurrentUserResponse>(STORAGE_KEYS.mockUser, {
    userId: 101,
    name: "Demo Shopper",
    email: "demo@shopsense.com",
    role: "CUSTOMER",
  });
}

function toRecommendation(product: ProductResponse, reason: string, score: number): RecommendationResponse {
  return {
    productId: product.id,
    name: product.name,
    brand: product.brand,
    categoryName: product.categoryName,
    price: product.price,
    imageUrl: product.imageUrl,
    averageRating: product.averageRating,
    reason,
    score,
  };
}

function searchProducts(params: ProductSearchParams = {}) {
  const query = params.query?.trim().toLowerCase();
  const category = params.category?.trim().toLowerCase();
  const brand = params.brand?.trim().toLowerCase();

  return products.filter((product) => {
    const matchesQuery =
      !query ||
      [product.name, product.description, product.brand, product.categoryName]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    const matchesCategory = !category || product.categoryName?.toLowerCase() === category;
    const matchesBrand = !brand || product.brand?.toLowerCase() === brand;
    const matchesMin = params.minPrice === undefined || product.price >= params.minPrice;
    const matchesMax = params.maxPrice === undefined || product.price <= params.maxPrice;

    return matchesQuery && matchesCategory && matchesBrand && matchesMin && matchesMax;
  });
}

function page<T>(content: T[], pageNumber = 0, size = 24): PageResponse<T> {
  return {
    content,
    totalElements: content.length,
    totalPages: Math.max(1, Math.ceil(content.length / size)),
    size,
    number: pageNumber,
    first: pageNumber === 0,
    last: true,
    empty: content.length === 0,
  };
}

export const authApi = {
  login: async (payload: AuthRequest): Promise<AuthResponse> => {
    await delay();
    const role = payload.email.toLowerCase().includes("admin") ? "ADMIN" : "CUSTOMER";
    const user: CurrentUserResponse = {
      userId: role === "ADMIN" ? 1 : 101,
      name: role === "ADMIN" ? "Admin" : "Demo Shopper",
      email: payload.email,
      role,
    };
    writeJson(STORAGE_KEYS.mockUser, user);
    return { ...user, token: `mock-token-${Date.now()}` };
  },
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    await delay();
    const user: CurrentUserResponse = {
      userId: 102,
      name: payload.name,
      email: payload.email,
      role: "CUSTOMER",
    };
    writeJson(STORAGE_KEYS.mockUser, user);
    return { ...user, token: `mock-token-${Date.now()}` };
  },
  me: async (): Promise<CurrentUserResponse> => {
    await delay(120);
    return currentUser();
  },
};

export const productApi = {
  search: async (params: ProductSearchParams = {}): Promise<PageResponse<ProductResponse>> => {
    await delay();
    return page(searchProducts(params), params.page ?? 0, params.size ?? 24);
  },
  findById: async (id: number): Promise<ProductResponse> => {
    await delay();
    const product = products.find((item) => item.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  },
  similar: async (id: number): Promise<RecommendationResponse[]> => {
    await delay();
    const product = products.find((item) => item.id === id);
    return products
      .filter((item) => item.id !== id)
      .sort((a, b) => Number(b.categoryName === product?.categoryName) - Number(a.categoryName === product?.categoryName))
      .slice(0, 4)
      .map((item, index) => toRecommendation(item, "Similar category, rating, or shopping intent.", 0.9 - index * 0.08));
  },
};

export const categoryApi = {
  findAll: async (): Promise<CategoryResponse[]> => {
    await delay(150);
    return categories;
  },
};

export const cartApi = {
  get: async (): Promise<CartResponse> => {
    await delay(120);
    return getCart();
  },
  addItem: async (payload: CartItemRequest): Promise<CartResponse> => {
    await delay();
    const product = products.find((item) => item.id === payload.productId);
    if (!product) throw new Error("Product not found");

    const cart = getCart();
    const existing = cart.items.find((item) => item.productId === payload.productId);
    const items = existing
      ? cart.items.map((item) =>
          item.productId === payload.productId
            ? {
                ...item,
                quantity: item.quantity + payload.quantity,
                lineTotal: product.price * (item.quantity + payload.quantity),
              }
            : item,
        )
      : [
          ...cart.items,
          {
            itemId: Date.now(),
            productId: product.id,
            productName: product.name,
            imageUrl: product.imageUrl,
            priceAtTime: product.price,
            quantity: payload.quantity,
            lineTotal: product.price * payload.quantity,
          },
        ];

    return setCart(buildCart(items));
  },
  updateItem: async (itemId: number, payload: CartItemRequest): Promise<CartResponse> => {
    await delay();
    const cart = getCart();
    const product = products.find((item) => item.id === payload.productId);
    const items = cart.items.map((item) =>
      item.itemId === itemId
        ? {
            ...item,
            quantity: payload.quantity,
            lineTotal: (product?.price ?? item.priceAtTime) * payload.quantity,
          }
        : item,
    );
    return setCart(buildCart(items));
  },
  removeItem: async (itemId: number): Promise<CartResponse> => {
    await delay();
    return setCart(buildCart(getCart().items.filter((item) => item.itemId !== itemId)));
  },
};

export const orderApi = {
  placeOrder: async (): Promise<OrderResponse> => {
    await delay();
    const cart = getCart();
    if (cart.items.length === 0) throw new Error("Your cart is empty");

    const order: OrderResponse = {
      orderId: Date.now(),
      totalAmount: cart.totalAmount,
      paymentStatus: "PENDING",
      orderStatus: "CREATED",
      createdAt: new Date().toISOString(),
      items: cart.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtTime,
        lineTotal: item.lineTotal,
      })),
    };

    setOrders([order, ...getOrders()]);
    setCart(buildCart([]));
    return order;
  },
  findMyOrders: async (): Promise<OrderResponse[]> => {
    await delay();
    return getOrders();
  },
  findMyOrderById: async (orderId: number): Promise<OrderResponse> => {
    await delay();
    const order = getOrders().find((item) => item.orderId === orderId);
    if (!order) throw new Error("Order not found");
    return order;
  },
  mockPayment: async (orderId: number, payload: PaymentRequest): Promise<PaymentResponse> => {
    await delay();
    const orders = getOrders();
    const updated = orders.map((order) =>
      order.orderId === orderId
        ? {
            ...order,
            paymentStatus: payload.success ? ("PAID" as const) : ("FAILED" as const),
            orderStatus: payload.success ? ("CONFIRMED" as const) : order.orderStatus,
          }
        : order,
    );
    setOrders(updated);
    return {
      orderId,
      paymentStatus: payload.success ? "PAID" : "FAILED",
      orderStatus: payload.success ? "CONFIRMED" : "CREATED",
      message: `${payload.paymentMethod} payment ${payload.success ? "completed" : "failed"}.`,
    };
  },
};

export const reviewApi = {
  findApproved: async (productId: number): Promise<ReviewResponse[]> => {
    await delay();
    return getReviews().filter((review) => review.productId === productId && review.moderationStatus === "APPROVED");
  },
  create: async (productId: number, payload: ReviewRequest): Promise<ReviewResponse> => {
    await delay();
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error("Product not found");

    const review: ReviewResponse = {
      id: Date.now(),
      productId,
      productName: product.name,
      userId: currentUser().userId,
      userName: currentUser().name,
      rating: payload.rating,
      comment: payload.comment,
      sentiment: payload.rating >= 4 ? "POSITIVE" : payload.rating === 3 ? "NEUTRAL" : "NEGATIVE",
      moderationStatus: "APPROVED",
      aiConfidence: 0.88,
      moderationReason: "Mock review auto-approved for frontend demo",
      createdAt: new Date().toISOString(),
    };
    setReviews([review, ...getReviews()]);
    return review;
  },
};

export const recommendationApi = {
  popular: async (): Promise<RecommendationResponse[]> => {
    await delay();
    return products.map((product, index) => toRecommendation(product, "Popular with shoppers this week.", 0.95 - index * 0.06));
  },
  forMe: async (): Promise<RecommendationResponse[]> => {
    await delay();
    return products
      .slice()
      .reverse()
      .map((product, index) => toRecommendation(product, "Recommended from your recent browsing and cart activity.", 0.94 - index * 0.05));
  },
};

export const aiApi = {
  shoppingAssistant: async (payload: ShoppingAssistantRequest): Promise<ShoppingAssistantResponse> => {
    await delay(450);
    const matches = searchProducts({ query: payload.message }).slice(0, 3);
    const recommended = (matches.length ? matches : products.slice(0, 3)).map((product) => ({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      averageRating: product.averageRating,
      reason: "Matches your request, budget, or shopping intent.",
    }));

    return {
      answer:
        recommended.length > 0
          ? "Here are a few picks that fit what you asked for. You can open any product to compare details or add it to your cart."
          : "I could not find a perfect match, but you can broaden the search from the products page.",
      recommendedProducts: recommended,
    };
  },
  semanticSearch: async (payload: SemanticSearchRequest): Promise<SemanticSearchResponse[]> => {
    await delay();
    return searchProducts({ query: payload.query }).map((product, index) => ({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      categoryName: product.categoryName,
      price: product.price,
      imageUrl: product.imageUrl,
      averageRating: product.averageRating,
      similarityScore: 0.92 - index * 0.08,
    }));
  },
};
