export type Role = "CUSTOMER" | "ADMIN";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type OrderStatus = "CREATED" | "CONFIRMED" | "CANCELLED";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ReviewSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "TOXIC" | "SPAM";

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends AuthRequest {
  name: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export type CurrentUserResponse = Omit<AuthResponse, "token">;

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface CategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  brand?: string | null;
  imageUrl?: string | null;
  averageRating?: number | null;
  active: boolean;
  categoryId: number;
  categoryName?: string | null;
}

export interface ProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  brand?: string;
  imageUrl?: string;
  categoryId: number;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItemResponse {
  itemId: number;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  priceAtTime: number;
  quantity: number;
  lineTotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItemResponse[];
  totalAmount: number;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  lineTotal: number;
}

export interface OrderResponse {
  orderId: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface PaymentRequest {
  paymentMethod: string;
  success: boolean;
}

export interface PaymentResponse {
  orderId: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  message: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  rating: number;
  comment?: string | null;
  sentiment: ReviewSentiment;
  moderationStatus: ModerationStatus;
  aiConfidence?: number | null;
  moderationReason?: string | null;
  createdAt: string;
}

export interface RecommendationResponse {
  productId: number;
  name: string;
  brand?: string | null;
  categoryName?: string | null;
  price: number;
  imageUrl?: string | null;
  averageRating?: number | null;
  reason?: string | null;
  score?: number | null;
}

export interface ShoppingAssistantRequest {
  message: string;
}

export interface ShoppingAssistantProductResponse {
  productId: number;
  name: string;
  brand?: string | null;
  price: number;
  averageRating?: number | null;
  reason?: string | null;
}

export interface ShoppingAssistantResponse {
  answer: string;
  recommendedProducts: ShoppingAssistantProductResponse[];
}

export interface SemanticSearchRequest {
  query: string;
}

export interface SemanticSearchResponse {
  productId: number;
  name: string;
  brand?: string | null;
  categoryName?: string | null;
  price: number;
  imageUrl?: string | null;
  averageRating?: number | null;
  similarityScore: number;
}

export interface InventoryResponse {
  id: number;
  productId: number;
  productName: string;
  quantityAvailable: number;
  reservedQuantity: number;
}

export interface InventoryRequest {
  quantityAvailable: number;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}
