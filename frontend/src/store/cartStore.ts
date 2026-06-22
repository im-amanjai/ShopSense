import { create } from "zustand";
import { cartApi } from "../api/services";
import { getApiErrorMessage } from "../api/client";
import type { CartResponse } from "../types/api";

interface CartStore {
  cart: CartResponse | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  totalAmount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, productId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearLocalCart: () => void;
}

function summarize(cart: CartResponse | null) {
  return {
    itemCount: cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
    totalAmount: cart?.totalAmount ?? 0,
  };
}

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,
  totalAmount: 0,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.get();
      set({ cart, ...summarize(cart), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.addItem({ productId, quantity });
      set({ cart, ...summarize(cart), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  updateItem: async (itemId, productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.updateItem(itemId, { productId, quantity });
      set({ cart, ...summarize(cart), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.removeItem(itemId);
      set({ cart, ...summarize(cart), isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  clearLocalCart: () => set({ cart: null, itemCount: 0, totalAmount: 0, error: null }),
}));
