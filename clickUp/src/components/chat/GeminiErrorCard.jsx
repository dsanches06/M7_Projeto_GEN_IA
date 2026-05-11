// ── GeminiErrorCard ───────────────────────────────────────────────────────────
// Mostra um card de erro quando o Gemini não responde
// Usado dentro de ChatUI.jsx

const ERROR_CONFIG = {
  SERVICE_DOWN: {
    icon:  "🔧",
    color: "#F97316",
    title: "Serviço em baixo",
    bg:    "#FFF7ED",
    border:"#FED7AA",
  },
  RATE_LIMIT: {
    icon:  "⏳",
    color: "#EAB308",
    title: "Limite atingido",
    bg:    "#FEFCE8",
    border:"#FEF08A",
  },
  AUTH_ERROR: {
    icon:  "🔑",
    color: "#EF4444",
    title: "Erro de autenticação",
    bg:    "#FEF2F2",
    border:"#FECACA",
  },
  NETWORK_ERROR: {
    icon:  "🌐",
    color: "#6366F1",
    title: "Sem ligação",
    bg:    "#EEF2FF",
    border:"#C7D2FE",
  },
  INVALID_REQUEST: {
    icon:  "✏️",
    color: "#8B5CF6",
    title: "Pedido inválido",
    bg:    "#F5F3FF",
    border:"#DDD6FE",
  },
  UNKNOWN: {
    icon:  "🤖",
    color: "#6B7280",
    title: "IA indisponível",
    bg:    "#F9FAFB",
    border:"#E5E7EB",
  },
};

export function GeminiErrorCard({ errorType = "UNKNOWN", message, onRetry }) {
  const cfg = ERROR_CONFIG[errorType] || ERROR_CONFIG.UNKNOWN;

  return (
    <div
      className="rounded-xl p-3 text-sm"
      style={{
        background:  cfg.bg,
        border:      `1px solid ${cfg.border}`,
        borderLeft:  `3px solid ${cfg.color}`,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{cfg.icon}</span>
        <span className="font-semibold text-xs" style={{ color: cfg.color }}>
          {cfg.title}
        </span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed mb-2">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{
            background: cfg.color,
            color:      "#fff",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ↺ Tentar novamente
        </button>
      )}
    </div>
  );
}
