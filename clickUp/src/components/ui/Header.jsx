import { NavLink } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ui";
import NotificationButton from "../notifications/NotificationButton.jsx";

// Cabeçalho fixo com logo, navegação desktop, toggle de tema e notificações
export function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Utilizador autenticado (null = sem autenticação implementada ainda)
  const user = null;

  // Itens do menu de navegação desktop
  const menuItems = [
    { id: "dashboard",    path: "/dashboard",    label: "Dashboard" },
    { id: "utilizadores", path: "/utilizadores", label: "Utilizadores" },
    { id: "tickets",      path: "/tickets",       label: "Tickets" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 sm:px-6 py-2.5 transition-colors"
      style={{
        background: isDark
          ? "rgba(13,13,13,0.88)"
          : "rgba(248,250,252,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: isDark
          ? "0 1px 0 rgba(255,255,255,0.06)"
          : "0 1px 0 rgba(0,0,0,0.08)",
      }}
    >
      {/* Logo / nome da aplicação */}
      <div className="flex-shrink-0 mr-auto">
        <h1
          className="text-xl sm:text-2xl font-bold tracking-tight"
          style={{ color: isDark ? "#ffffff" : "#0f172a" }}
        >
          ClickUp
        </h1>
      </div>

      {/* Navegação desktop (oculta em mobile) */}
      <nav className="hidden md:flex flex-1 justify-center">
        <ul className="flex gap-4 items-center">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  font-semibold transition-all duration-200 px-3 py-1.5 rounded-md text-sm
                  ${isActive
                    ? isDark
                      ? "bg-white text-slate-900"
                      : "bg-slate-900 text-white"
                    : isDark
                      ? "text-gray-300 hover:text-white hover:bg-slate-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-gray-200"
                  }
                `}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Acções à direita: tema, notificações e avatar */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <NotificationButton user={user} />
        {/* Avatar do utilizador (placeholder) */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
          style={{
            background: isDark ? "#334155" : "#e2e8f0",
            color:      isDark ? "#e2e8f0" : "#475569",
          }}
        >
          U
        </div>
      </div>
    </header>
  );
}
