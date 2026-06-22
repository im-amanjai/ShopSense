import { type ReactNode, useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import FloatingChatButton from "../components/ai/FloatingChatButton";
import AIChatWindow from "../components/ai/AIChatWindow";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

interface MainLayoutProps {
  children: ReactNode;
}


export default function MainLayout({ children }: MainLayoutProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearLocalCart = useCartStore((state) => state.clearLocalCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => undefined);
    } else {
      clearLocalCart();
    }
  }, [clearLocalCart, fetchCart, isAuthenticated]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <Navbar />

      <main className="flex-1">{children}</main>

      <Footer />

      <FloatingChatButton onClick={() => setChatOpen(true)} />

      <AIChatWindow isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
