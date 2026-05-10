import React from "react";
import {
  formatDate,
  getSeverityStyle,
  ERROR_TYPE_CONFIG,
  STATUS_CONFIG,
} from "@/utils/ticketUtils";

export default function TicketCard({ ticket, onSelect, delay = 0 }) {
  const sev     = ticket.severity || 1;
  const sevStyle = getSeverityStyle(sev);
  const errCfg  =
    ERROR_TYPE_CONFIG[(ticket.error_type || "").toLowerCase()] ||
    ERROR_TYPE_CONFIG.other;
  const statCfg =
    STATUS_CONFIG[(ticket.status || "open").toLowerCase()] ||
    STATUS_CONFIG.open;

  return (
    <div
      className="rounded-2xl p-5 cursor-pointer group transition-all animate-fadeIn"
      style={{
        background:     sevStyle.bg,
        border:         `1px solid ${sevStyle.color}30`,
        borderLeft:     `4px solid ${sevStyle.color}`,
        borderRadius:   "1rem",
        boxShadow:      "0 1px 4px rgba(0,0,0,0.06)",
        animationDelay: `${delay}ms`,
        transition:     "transform 0.18s, box-shadow 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 6px 20px ${sevStyle.color}28`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "none";
      }}
      onClick={() => onSelect(ticket)}
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: sevStyle.color }}
        >
          #{ticket.id}
        </span>
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

      {/* ── Report text ── */}
      <p
        className="text-sm font-medium leading-snug mb-3 line-clamp-3"
        style={{ color: "#1a1a1a" }}
      >
        {ticket.user_report || "(sem descrição)"}
      </p>

      {/* ── Severity bar ── */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] uppercase tracking-wide"
            style={{ color: sevStyle.color }}
          >
            Severidade
          </span>
          <span
            className="text-[11px] font-bold"
            style={{ color: sevStyle.color }}
          >
            {sev}/10 · {sevStyle.label}
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: `${sevStyle.color}22` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width:           `${(sev / 10) * 100}%`,
              backgroundColor: sevStyle.color,
              transition:      "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── Fix suggestion ── */}
      {ticket.fix_suggestion && (
        <p
          className="text-[11px] italic line-clamp-2 mb-3 pl-2"
          style={{
            color:       `${sevStyle.color}bb`,
            borderLeft:  `2px solid ${sevStyle.color}44`,
            borderRadius: 0,
          }}
        >
          {ticket.fix_suggestion}
        </p>
      )}

      {/* ── Date ── */}
      <p className="text-[10px]" style={{ color: `${sevStyle.color}99` }}>
        {formatDate(ticket.created_at)}
      </p>
    </div>
  );
}
