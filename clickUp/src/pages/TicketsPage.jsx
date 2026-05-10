import { useState, useEffect, useCallback } from "react";
import { getBackendUrl } from "@/services/BaseService.js";
import TicketCard from "@/components/ticket/TicketCard.jsx";
import { STATUS_CONFIG } from "@/utils/ticketUtils.js";

const BACKEND_URL = getBackendUrl();

/* ── inline SVG icon helpers ── */
function IconTicket() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="28"
      height="28"
    >
      <path d="M15 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-4-4z" />
      <polyline points="15 5 15 9 19 9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  );
}
function IconOpen() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="28"
      height="28"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function IconHigh() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="28"
      height="28"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconDone() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="28"
      height="28"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [sortDir, setSortDir] = useState("NONE"); // NONE | ASC | DESC
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [selected, setSelected] = useState(null); // eslint-disable-line no-unused-vars

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tickets`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTickets(await res.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ── Stats ── */
  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const highCount = tickets.filter((t) => (t.severity || 0) >= 7).length;
  const doneCount = tickets.filter((t) => t.status === "resolved").length;

  const statCards = [
    {
      label: "Total",
      value: total,
      icon: <IconTicket />,
      filter: "all-status",
      color: "#2563EB",
    },
    {
      label: "Abertos",
      value: openCount,
      icon: <IconOpen />,
      filter: "open",
      color: "#EF4444",
    },
    {
      label: "Alta severidade",
      value: highCount,
      icon: <IconHigh />,
      filter: "high-sev",
      color: "#D97706",
    },
    {
      label: "Resolvidos",
      value: doneCount,
      icon: <IconDone />,
      filter: "resolved",
      color: "#16A34A",
    },
  ];

  /* active card = which filter is selected */
  const activeCard =
    filterStatus === "open"
      ? "open"
      : filterStatus === "resolved"
        ? "resolved"
        : filterSev === "high"
          ? "high-sev"
          : "all-status";

  function handleStatClick(filter) {
    if (filter === "all-status") {
      setFilterStatus("all");
      setFilterSev("all");
    } else if (filter === "open") {
      setFilterStatus("open");
      setFilterSev("all");
    } else if (filter === "resolved") {
      setFilterStatus("resolved");
      setFilterSev("all");
    } else if (filter === "high-sev") {
      setFilterSev("high");
      setFilterStatus("all");
    }
  }

  /* ── Cycle sort ── */
  function cycleSortDir() {
    setSortDir((d) => (d === "NONE" ? "ASC" : d === "ASC" ? "DESC" : "NONE"));
  }

  /* ── Filter + sort ── */
  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (t.user_report || "").toLowerCase().includes(q) ||
      (t.error_type || "").toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const s = t.severity || 0;
    const matchSev =
      filterSev === "all" ||
      (filterSev === "critical" && s >= 8) ||
      (filterSev === "high" && s >= 5 && s < 8) ||
      (filterSev === "medium" && s >= 3 && s < 5) ||
      (filterSev === "low" && s < 3);
    return matchSearch && matchStatus && matchSev;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortDir === "ASC") return (a.severity || 0) - (b.severity || 0);
    if (sortDir === "DESC") return (b.severity || 0) - (a.severity || 0);
    return 0;
  });

  /* ── Filter label ── */
  const filterLabel =
    filterStatus !== "all"
      ? STATUS_CONFIG[filterStatus]?.label || filterStatus
      : filterSev !== "all"
        ? filterSev === "critical"
          ? "Crítica (8-10)"
          : filterSev === "high"
            ? "Alta (5-7)"
            : filterSev === "medium"
              ? "Média (3-4)"
              : "Baixa (1-2)"
        : "Todos";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      {/* ── Page title ── */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-main">Tickets</h2>
        <p className="text-muted text-sm mt-0.5">
          Gestão de tickets criados via ChatBot ou manualmente
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statCards.map(({ label, value, icon, filter, color }) => {
            const isSelected = activeCard === filter;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleStatClick(filter)}
                className={`flex items-center gap-3 rounded-3xl p-2 text-left transition-colors cursor-pointer hover:bg-surface-2 ${
                  isSelected
                    ? "bg-surface-2 border border-surface"
                    : "bg-surface"
                }`}
              >
                <span
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
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

        {/* Filter controls row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity dropdown */}
          <select
            className="h-8 bg-surface border border-surface rounded-lg px-2.5 text-xs text-main focus:outline-none focus:border-[var(--primary)] transition-colors"
            value={filterSev}
            onChange={(e) => setFilterSev(e.target.value)}
          >
            <option value="all">Toda severidade</option>
            <option value="critical">Crítica (8–10)</option>
            <option value="high">Alta (5–7)</option>
            <option value="medium">Média (3–4)</option>
            <option value="low">Baixa (1–2)</option>
          </select>

          {/* Status dropdown */}
          <select
            className="h-8 bg-surface border border-surface rounded-lg px-2.5 text-xs text-main focus:outline-none focus:border-[var(--primary)] transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos os estados</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Spacer */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search input */}
            {showSearch && (
              <input
                autoFocus
                className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] w-48 transition-all"
                placeholder="Pesquisar ticket..."
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
              title="Ordenar por severidade"
              onClick={cycleSortDir}
              className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {sortDir === "ASC" ? "⬆" : sortDir === "DESC" ? "⬇" : "⇅"}
            </button>

            <button
              onClick={load}
              title="Recarregar"
              className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className="text-center py-16 text-muted text-sm">
          A carregar tickets…
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-10">
          <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-red-600/20 bg-red-600/5 p-8 mx-auto max-w-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10 text-red-600 animate-pulse text-2xl">
              ⚠️
            </div>
            <div>
              <p className="text-lg font-semibold text-red-100">
                Servidor indisponível
              </p>
              <p className="mt-1 text-sm text-red-200">
                Erro ao carregar tickets: {error}
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-red-500 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">🎟️</p>
          <p className="text-muted text-sm">
            {tickets.length === 0
              ? "Nenhum ticket ainda. Cria um via ChatBot!"
              : "Nenhum ticket corresponde aos filtros."}
          </p>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          <p className="text-xs text-muted mb-3">
            {sorted.length} ticket{sorted.length !== 1 ? "s" : ""}
          </p>

          <section className="bg-surface-2 border border-surface rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-main">Tickets</h3>
                <p className="text-muted mt-1 max-w-2xl text-sm">
                  Use o ChatBot 🤖 ao lado para criar novos tickets utilizando
                  inteligência artificial.
                </p>
              </div>
              <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-3 whitespace-nowrap">
                Filtro: {filterLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {sorted.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelected}
                  delay={index * 60}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
