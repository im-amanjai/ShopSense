import axios, { AxiosError } from "axios";
import type { ApiErrorBody } from "../types/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.toString() || "";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopsense_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.status === 502 || error.code === "ERR_NETWORK") {
      return "The service is not reachable. The current frontend demo uses local mock data.";
    }

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function isUnauthorized(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (error as AxiosError).response?.status === 401
  );
}
