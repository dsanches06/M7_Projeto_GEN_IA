import { useState, useEffect } from "react";
import { getPalette, getInitials } from "../../utils/userUtils.js";
import { getBackendUrl } from "@/services/BaseService.js";

const BACKEND_URL = getBackendUrl();

const STATUS_CONFIG = [
  { id: "CREATED", label: "CREATED", bg: "#FEFCE8", cardBorder: "#EAB308" },
  { id: "ASSIGNED", label: "ASSIGNED", bg: "#EFF6FF", cardBorder: "#3B82F6" },
  { id: "BLOCKED", label: "BLOCKED", bg: "#FFF1F2", cardBorder: "#EF4444" },
  {
    id: "IN_PROGRESS",
    label: "IN_PROGRESS",
    bg: "#F5F3FF",
    cardBorder: "#8B5CF6",
  },
  { id: "COMPLETED", label: "COMPLETED", bg: "#F0FDF4", cardBorder: "#22C55E" },
  { id: "ARCHIVED", label: "ARCHIVED", bg: "#F9FAFB", cardBorder: "#9CA3AF" },
];

const STATUS_ICON = {
  CREATED: "📋",
  ASSIGNED: "👤",
  IN_PROGRESS: "🔄",
  BLOCKED: "🔴",
  COMPLETED: "✅",
  ARCHIVED: "📦",
};

/* ── Kanban task card ── */
function TaskCard({ task, cardBorder, userName }) {
  return (
    <div
      className="bg-white rounded-lg p-3"
      style={{
        borderLeft: `4px solid ${cardBorder}`,
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
      }}
    >
      <p className="text-[13px] font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2">
        {task.title}
      </p>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium text-gray-500">
          {task.sprint || "Sem Sprint"}
        </span>
        <span className="text-[11px] text-gray-400">{userName}</span>
        <span
          className="text-[10px] uppercase font-bold tracking-wider mt-0.5"
          style={{ color: cardBorder }}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
}

/* ── Status change modal ── */
/* ── Main component ── */
export default function UserDashboard({ user, onBack }) {
  const [tasks, setTasks] = useState(user.tasks || []);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortDir, setSortDir] = useState("NONE"); // NONE | ASC | DESC
  const [filterCol, setFilterCol] = useState("ALL"); // "ALL" or a STATUS_CONFIG id

  const c = getPalette(user.id);
  const firstName = (user.name || "").split(" ")[0];


  /* ── Stats ── */
  const statCards = [
    {
      label: "Total",
      value: tasks.length,
      icon: "📋",
      filter: "ALL",
      color: "#2563EB",
    },
    {
      label: "Pendentes",
      value: tasks.filter(
        (t) => t.status !== "COMPLETED" && t.status !== "ARCHIVED",
      ).length,
      icon: "⏳",
      filter: "IN_PROGRESS",
      color: "#8B5CF6",
    },
    {
      label: "Concluídas",
      value: tasks.filter((t) => t.status === "COMPLETED").length,
      icon: "✅",
      filter: "COMPLETED",
      color: "#22C55E",
    },
    {
      label: "Bloqueadas",
      value: tasks.filter((t) => t.status === "BLOCKED").length,
      icon: "🔴",
      filter: "BLOCKED",
      color: "#EF4444",
    },
  ];

  /* ── Filter pipeline ── */
  let filtered =
    filterCol === "ALL" ? tasks : tasks.filter((t) => t.status === filterCol);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.title.toLowerCase().includes(q));
  }

  if (sortDir === "ASC")
    filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sortDir === "DESC")
    filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));

  const byStatus = Object.fromEntries(
    STATUS_CONFIG.map((col) => [
      col.id,
      filtered.filter((t) => t.status === col.id),
    ]),
  );

  /* ── Handlers ── */
  function cycleSortDir() {
    setSortDir((d) => (d === "NONE" ? "ASC" : d === "ASC" ? "DESC" : "NONE"));
  }

  const filterLabel =
    filterCol === "ALL"
      ? "Todas"
      : STATUS_CONFIG.find((s) => s.id === filterCol)?.label || filterCol;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white-600 hover:text-white-900 transition-colors"
        >
          ← Voltar
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: c.bg, color: c.tx }}
          >
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-sm font-bold text-main leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-muted">{user.email}</p>
          </div>
        </div>
        <span
          className={`ml-auto text-xs px-3 py-1 rounded-full font-semibold ${
            user.active
              ? "bg-[#EAF3DE] text-[#3B6D11]"
              : "bg-[#FCEBEB] text-[#A32D2D]"
          }`}
        >
          {user.active ? "Ativo" : "Inativo"}
        </span>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statCards.map(({ label, value, icon, filter, color }, index) => {
            const isSelected = filterCol === filter;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setFilterCol(filter)}
                className={`flex items-center gap-3 rounded-3xl p-2 text-left transition-colors cursor-pointer hover:bg-surface-2 animate-fadeIn ${
                  isSelected
                    ? "bg-surface-2 border border-surface"
                    : "bg-surface"
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  {icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted uppercase tracking-[0.08em] leading-tight">
                    {label}
                  </p>
                  <p className="text-base font-semibold text-main">{value}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 ml-auto">
          {showSearch && (
            <input
              autoFocus
              className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] w-44 transition-all"
              placeholder="Pesquisar tarefa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2 hidden sm:inline-flex">
            Filtro: {filterLabel}
          </span>
          <button
            title="Pesquisar"
            onClick={() => {
              setShowSearch((s) => !s);
              setSearch("");
            }}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer text-base"
          >
            ⌕
          </button>
          <button
            title="Ordenar por título"
            onClick={cycleSortDir}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {sortDir === "ASC" ? "⬆" : sortDir === "DESC" ? "⬇" : "⇅"}
          </button>
        </div>
      </div>

      {/* ── Kanban columns ── */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 12, width: "100%" }}
      >
        {STATUS_CONFIG.map((col) => {
          const colTasks = byStatus[col.id] || [];
          return (
            <div
              key={col.id}
              style={{
                flex: "1 1 180px",
                minWidth: 180,
                maxWidth: 300,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Column header */}
              <div
                style={{
                  backgroundColor: col.bg,
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "#374151",
                  }}
                >
                  {STATUS_ICON[col.id]} {col.label}
                </span>
                <span
                  style={{
                    backgroundColor: col.cardBorder,
                    color: "#fff",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Column body */}
              <div
                style={{
                  backgroundColor: col.bg,
                  padding: 8,
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    cardBorder={col.cardBorder}
                    userName={firstName}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      color: "rgba(0,0,0,0.18)",
                      fontSize: 11,
                      paddingTop: 20,
                    }}
                  >
                    —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
