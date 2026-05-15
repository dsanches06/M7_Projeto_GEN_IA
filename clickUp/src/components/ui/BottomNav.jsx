import { NavLink } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

// Itens de navegação com ícones SVG e rotas associadas
const NAV_ITEMS = [
  {
    id: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "utilizadores",
    path: "/utilizadores",
    label: "Equipa",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "tickets",
    path: "/tickets",
    label: "Tickets",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-4-4z" />
        <polyline points="15 5 15 9 19 9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    ),
  },
];

// Barra de navegação inferior fixa — visível apenas em mobile
export function BottomNav() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        background:   isDark ? "rgba(13,13,13,0.96)" : "rgba(248,250,252,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop:    `1px solid ${isDark ? "#222" : "#e2e8f0"}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors select-none"
          style={({ isActive }) => ({
            color: isActive
              ? "var(--primary)"
              : isDark ? "#6b7280" : "#94a3b8",
          })}
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                {item.icon(isActive)}
                {/* Ponto indicador de rota activa */}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                )}
              </span>
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{ color: "inherit" }}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
