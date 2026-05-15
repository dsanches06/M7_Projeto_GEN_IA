import { Outlet } from "react-router-dom";
import { Header, Footer, BottomNav } from "@/components/ui";

// Layout principal — envolve todas as páginas com cabeçalho, rodapé e navegação
export default function MainLayout() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      {/* main: top padding = header height; bottom padding = bottom nav height on mobile */}
      <main
        className="flex-1 overflow-hidden pt-[52px] pb-[64px] md:pb-0"
        style={{ minHeight: "100dvh" }}
      >
        <Outlet />
      </main>

      {/* Rodapé visível apenas em desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Navegação inferior para mobile */}
      <BottomNav />
    </div>
  );
}
