import { create } from "zustand";
import { authApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { AuthRequest, AuthResponse, CurrentUserResponse, RegisterRequest } from "../types/api";

type AuthUser = CurrentUserResponse;

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (payload: AuthRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  hydrateUser: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const TOKEN_KEY = "shopsense_token";
const USER_KEY = "shopsense_user";

function toUser(response: AuthResponse): AuthUser {
  return {
    userId: response.userId,
    name: response.name,
    email: response.email,
    role: response.role,
  };
}

function readStoredUser() {
  const stored = localStorage.getItem(USER_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: readStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(payload);
      const user = toUser(response);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token: response.token, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(payload);
      const user = toUser(response);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ token: response.token, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  hydrateUser: async () => {
    if (!get().token) return;

    set({ isLoading: true, error: null });
    try {
      const user = await authApi.me();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      get().logout();
      set({ error: getApiErrorMessage(error), isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, error: null, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
