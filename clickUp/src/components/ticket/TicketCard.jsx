import React from "react";
import {
  formatDate,
  getSeverityStyle,
  ERROR_TYPE_CONFIG,
  STATUS_CONFIG,
} from "@/utils/ticketUtils";

// Componente de cartão de ticket
export default function TicketCard({ ticket, onSelect, delay = 0 }) {
  const sevStyle = getSeverityStyle(ticket.severity || 5);
  const errCfg =
    ERROR_TYPE_CONFIG[(ticket.error_type || "").toLowerCase()] ||
    ERROR_TYPE_CONFIG.other;
  const statCfg =
    STATUS_CONFIG[(ticket.status || "open").toLowerCase()] ||
    STATUS_CONFIG.open;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer group transition-all animate-fadeIn"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "none";
      }}
      onClick={() => onSelect(ticket)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: errCfg.bg, color: errCfg.color }}
          >
            {errCfg.label}
          </span>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: statCfg.bg, color: statCfg.color }}
          >
            {statCfg.label}
          </span>
        </div>
      </div>

      {/* Report */}
      <p className="text-sm font-medium text-gray-800 leading-snug mb-3 line-clamp-3">
        {ticket.user_report || "(sem descrição)"}
      </p>

      {/* Severity bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">
            Severidade
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: sevStyle.color }}
          >
            {ticket.severity || 0}/10 · {sevStyle.label}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${((ticket.severity || 0) / 10) * 100}%`,
              backgroundColor: sevStyle.color,
            }}
          />
        </div>
      </div>

      {/* Fix suggestion preview */}
      {ticket.fix_suggestion && (
        <p className="text-[11px] text-gray-400 italic line-clamp-2 mb-3 border-l-2 border-gray-200 pl-2">
          {ticket.fix_suggestion}
        </p>
      )}

      {/* Date */}
      <p className="text-[10px] text-gray-400">
        {formatDate(ticket.created_at)}
      </p>
    </div>
  );
}
