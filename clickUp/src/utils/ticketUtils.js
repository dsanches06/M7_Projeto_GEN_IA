
// Configurações de tipos de erro para tickets (chaves = error_type da DB em lowercase)
export const ERROR_TYPE_CONFIG = {
  api:         { label: "API",         bg: "#EFF6FF", color: "#3B82F6" },
  database:    { label: "Database",    bg: "#FFF7ED", color: "#F97316" },
  ui:          { label: "UI",          bg: "#F0FDF4", color: "#22C55E" },
  network:     { label: "Network",     bg: "#FDF4FF", color: "#A855F7" },
  auth:        { label: "Auth",        bg: "#FFF1F2", color: "#EF4444" },
  performance: { label: "Performance", bg: "#FFFBEB", color: "#D97706" },
  other:       { label: "Outro",       bg: "#F9FAFB", color: "#6B7280" },
};

// Configurações de estado para tickets
export const STATUS_CONFIG = {
  open:        { label: "Aberto",    bg: "#FFF1F2", color: "#EF4444" },
  in_progress: { label: "Em curso",  bg: "#FFF7ED", color: "#F97316" },
  resolved:    { label: "Resolvido", bg: "#F0FDF4", color: "#22C55E" },
  closed:      { label: "Fechado",   bg: "#F9FAFB", color: "#6B7280" },
};

// Obtém estilo de severidade baseado no valor (1-10)
export function getSeverityStyle(sev) {
  if (sev >= 8) return { color: "#DC2626", bg: "#FEE2E2", label: "Crítica" };
  if (sev >= 5) return { color: "#D97706", bg: "#FEF3C7", label: "Alta" };
  if (sev >= 3) return { color: "#2563EB", bg: "#DBEAFE", label: "Média" };
  return { color: "#16A34A", bg: "#DCFCE7", label: "Baixa" };
}

// Formata data para "dd Mmm yyyy" ou retorna "—" se inválida
export function formatDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}
