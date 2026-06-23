import { apiClient } from "./client";
import bluetoothspeaker from "../assets/bluetoothspeaker.jpg";
import gamingmouse from "../assets/gamingmouse.jpg";
import headphones from "../assets/headphones.jpg";
import runningshoes from "../assets/runningshoes.jpg";
import smartwatch from "../assets/smartwatch.jpg";
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

const frontendImages: Record<string, string> = {
  "frontend:headphones": headphones,
  "frontend:gamingmouse": gamingmouse,
  "frontend:smartwatch": smartwatch,
  "frontend:runningshoes": runningshoes,
  "frontend:bluetoothspeaker": bluetoothspeaker,
  "sony-wh-ch720n": headphones,
  "rgb-precision-gaming-mouse": gamingmouse,
  "fitpulse-amoled-smart-watch": smartwatch,
  "aerorun-daily-running-shoes": runningshoes,
  "boom-mini-bluetooth-speaker": bluetoothspeaker,
};

function toCategorySlug(category?: string) {
  return category?.trim().toLowerCase().replace(/\s+/g, "-") || undefined;
}

function resolveImageUrl(imageUrl?: string | null, slug?: string | null) {
  if (imageUrl && frontendImages[imageUrl]) return frontendImages[imageUrl];
  if (slug && frontendImages[slug]) return frontendImages[slug];
  return imageUrl;
}

function normalizeProduct(product: ProductResponse): ProductResponse {
  return {
    ...product,
    imageUrl: resolveImageUrl(product.imageUrl, product.slug),
  };
}

function normalizeRecommendation(item: RecommendationResponse): RecommendationResponse {
  return {
    ...item,
    imageUrl: resolveImageUrl(item.imageUrl),
  };
}

function normalizeSemanticResult(item: SemanticSearchResponse): SemanticSearchResponse {
  return {
    ...item,
    imageUrl: resolveImageUrl(item.imageUrl),
  };
}

function normalizeCart(cart: CartResponse): CartResponse {
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      imageUrl: resolveImageUrl(item.imageUrl),
    })),
  };
}

export const authApi = {
  login: async (payload: AuthRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  me: async (): Promise<CurrentUserResponse> => {
    const { data } = await apiClient.get<CurrentUserResponse>("/auth/me");
    return data;
  },
};

export const productApi = {
  search: async (params: ProductSearchParams = {}): Promise<PageResponse<ProductResponse>> => {
    const { data } = await apiClient.get<PageResponse<ProductResponse>>("/products", {
      params: {
        ...params,
        category: toCategorySlug(params.category),
      },
    });
    return {
      ...data,
      content: data.content.map(normalizeProduct),
    };
  },

  findById: async (id: number): Promise<ProductResponse> => {
    const { data } = await apiClient.get<ProductResponse>(`/products/${id}`);
    return normalizeProduct(data);
  },

  similar: async (id: number): Promise<RecommendationResponse[]> => {
    const { data } = await apiClient.get<RecommendationResponse[]>(`/products/${id}/similar`);
    return data.map(normalizeRecommendation);
  },
};

export const categoryApi = {
  findAll: async (): Promise<CategoryResponse[]> => {
    const { data } = await apiClient.get<CategoryResponse[]>("/categories");
    return data;
  },
};

export const cartApi = {
  get: async (): Promise<CartResponse> => {
    const { data } = await apiClient.get<CartResponse>("/cart");
    return normalizeCart(data);
  },

  addItem: async (payload: CartItemRequest): Promise<CartResponse> => {
    const { data } = await apiClient.post<CartResponse>("/cart/items", payload);
    return normalizeCart(data);
  },

  updateItem: async (itemId: number, payload: CartItemRequest): Promise<CartResponse> => {
    const { data } = await apiClient.put<CartResponse>(`/cart/items/${itemId}`, payload);
    return normalizeCart(data);
  },

  removeItem: async (itemId: number): Promise<CartResponse> => {
    const { data } = await apiClient.delete<CartResponse>(`/cart/items/${itemId}`);
    return normalizeCart(data);
  },
};

export const orderApi = {
  placeOrder: async (): Promise<OrderResponse> => {
    const { data } = await apiClient.post<OrderResponse>("/orders");
    return data;
  },

  findMyOrders: async (): Promise<OrderResponse[]> => {
    const { data } = await apiClient.get<OrderResponse[]>("/orders");
    return data;
  },

  findMyOrderById: async (orderId: number): Promise<OrderResponse> => {
    const { data } = await apiClient.get<OrderResponse>(`/orders/${orderId}`);
    return data;
  },

  mockPayment: async (orderId: number, payload: PaymentRequest): Promise<PaymentResponse> => {
    const { data } = await apiClient.post<PaymentResponse>(`/orders/${orderId}/payment/mock`, {
      paymentMethod: payload.paymentMethod,
      success: payload.success,
    });
    return data;
  },
};

export const reviewApi = {
  findApproved: async (productId: number): Promise<ReviewResponse[]> => {
    const { data } = await apiClient.get<ReviewResponse[]>(`/products/${productId}/reviews`);
    return data;
  },

  create: async (productId: number, payload: ReviewRequest): Promise<ReviewResponse> => {
    const { data } = await apiClient.post<ReviewResponse>(`/products/${productId}/reviews`, payload);
    return data;
  },
};

export const recommendationApi = {
  popular: async (): Promise<RecommendationResponse[]> => {
    const { data } = await apiClient.get<RecommendationResponse[]>("/recommendations/popular");
    return data.map(normalizeRecommendation);
  },

  forMe: async (): Promise<RecommendationResponse[]> => {
    const { data } = await apiClient.get<RecommendationResponse[]>("/recommendations/me");
    return data.map(normalizeRecommendation);
  },
};

export const aiApi = {
  shoppingAssistant: async (payload: ShoppingAssistantRequest): Promise<ShoppingAssistantResponse> => {
    const { data } = await apiClient.post<ShoppingAssistantResponse>("/ai/shopping-assistant", payload);
    return data;
  },

  semanticSearch: async (payload: SemanticSearchRequest): Promise<SemanticSearchResponse[]> => {
    const { data } = await apiClient.post<SemanticSearchResponse[]>("/ai/semantic-search", payload);
    return data.map(normalizeSemanticResult);
  },
};
