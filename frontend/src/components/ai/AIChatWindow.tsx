import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, X } from "lucide-react";
import ProductRecommendationCard from "./ProductRecommendationCard";
import { aiApi } from "../../api/services";
import { getApiErrorMessage } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import type { ShoppingAssistantProductResponse } from "../../types/api";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  products: ShoppingAssistantProductResponse[];
}

interface AIChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatWindow({ isOpen, onClose }: AIChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hi! Ask me for product recommendations based on your budget, needs, or preferences.",
      products: [],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isTyping) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed, products: [] }]);
    setMessage("");

    if (!isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Please log in to use the shopping assistant.",
          products: [],
        },
      ]);
      return;
    }

    setIsTyping(true);
    try {
      const response = await aiApi.shoppingAssistant({ message: trimmed });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.answer,
          products: response.recommendedProducts ?? [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: getApiErrorMessage(error),
          products: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">ShopSense Assistant</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Mock AI recommendations for the frontend demo</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Close assistant"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={`${msg.sender}-${index}`}
            className={`rounded-lg p-3 text-sm ${
              msg.sender === "user"
                ? "ml-auto max-w-[82%] bg-blue-600 text-white"
                : "max-w-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100"
            }`}
          >
            <p>{msg.text}</p>
            {msg.sender === "ai" && !isAuthenticated && index === messages.length - 1 && (
              <Link to="/login" onClick={onClose} className="mt-3 inline-block font-semibold text-blue-700 dark:text-blue-300">
                Log in
              </Link>
            )}
            {msg.products.length > 0 && (
              <div className="mt-3 space-y-3">
                {msg.products.map((product) => (
                  <ProductRecommendationCard key={product.productId} product={product} />
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="w-fit rounded-lg bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Thinking...
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-3 flex flex-wrap gap-2">
          {["Best headphones under 5000", "Recommend gifts for gamers"].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setMessage(prompt)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            placeholder="Ask about products..."
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isTyping}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
