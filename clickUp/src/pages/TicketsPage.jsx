import { useState, useEffect, useCallback } from "react";
import { getBackendUrl } from "@/services/BaseService.js";
import TicketCard from "@/components/ticket/TicketCard.jsx";
import { STATUS_CONFIG } from "@/utils/ticketUtils.js";

const BACKEND_URL = getBackendUrl();

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSev, setFilterSev] = useState("all");
  const [selected, setSelected] = useState(null);

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


  // ── Stats ──
  const stats = [
    { label: "Total", value: tickets.length, color: "#2563EB", bg: "#EFF6FF" },
    {
      label: "Abertos",
      value: tickets.filter((t) => t.status === "open").length,
      color: "#EF4444",
      bg: "#FFF1F2",
    },
    {
      label: "Alta severidade",
      value: tickets.filter((t) => (t.severity || 0) >= 7).length,
      color: "#D97706",
      bg: "#FFF7ED",
    },
    {
      label: "Resolvidos",
      value: tickets.filter((t) => t.status === "resolved").length,
      color: "#16A34A",
      bg: "#F0FDF4",
    },
  ];

  // ── Filters ──
  const filtered = tickets.filter((t) => {
    const matchSearch =
      !search ||
      (t.user_report || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.error_type || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchSev =
      filterSev === "all" ||
      (filterSev === "critical" && (t.severity || 0) >= 8) ||
      (filterSev === "high" &&
        (t.severity || 0) >= 5 &&
        (t.severity || 0) < 8) ||
      (filterSev === "medium" &&
        (t.severity || 0) >= 3 &&
        (t.severity || 0) < 5) ||
      (filterSev === "low" && (t.severity || 0) < 3);
    return matchSearch && matchStatus && matchSev;
  });

  const statusLabel =
    filterStatus === "all"
      ? "Todos os estados"
      : STATUS_CONFIG[filterStatus]?.label || filterStatus;

  const severityLabel =
    filterSev === "all"
      ? "Toda severidade"
      : filterSev === "critical"
      ? "Crítica (8-10)"
      : filterSev === "high"
      ? "Alta (5-7)"
      : filterSev === "medium"
      ? "Média (3-4)"
      : "Baixa (1-2)";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      {/* ── Title ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-main">Tickets</h2>
        <p className="text-xs text-muted mt-0.5">
          Gestão de tickets criados via ChatBot ou manualmente
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="rounded-2xl p-5 shadow-sm border border-transparent"
              style={{ backgroundColor: bg }}
            >
              <p
                className="text-[11px] uppercase tracking-wide mb-1"
                style={{ color }}
              >
                {label}
              </p>
              <p className="text-3xl font-bold" style={{ color }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm flex-1 min-w-[180px]">
              <span className="text-gray-400 text-sm">⌕</span>
              <input
                className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none flex-1"
                placeholder="Pesquisar ticket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="h-9 bg-white border border-gray-200 rounded-lg px-2.5 text-sm text-gray-600 focus:outline-none shadow-sm"
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

            <select
              className="h-9 bg-white border border-gray-200 rounded-lg px-2.5 text-sm text-gray-600 focus:outline-none shadow-sm"
              value={filterSev}
              onChange={(e) => setFilterSev(e.target.value)}
            >
              <option value="all">Toda severidade</option>
              <option value="critical">Crítica (8-10)</option>
              <option value="high">Alta (5-7)</option>
              <option value="medium">Média (3-4)</option>
              <option value="low">Baixa (1-2)</option>
            </select>

            <button
              onClick={load}
              className="h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
              title="Recarregar"
            >
              ↺
            </button>
          </div>

          <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2 hidden sm:inline-flex">
            Filtro: {statusLabel} · {severityLabel}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div className="text-center py-16 text-gray-400 text-sm">
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
              <p className="text-lg font-semibold text-red-600">
                Servidor indisponível
              </p>
              <p className="mt-1 text-sm text-red-500">
                Erro ao carregar tickets: {error}
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-full border border-red-500 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">🎟️</p>
          <p className="text-gray-400 text-sm">
            {tickets.length === 0
              ? "Nenhum ticket ainda. Cria um via ChatBot!"
              : "Nenhum ticket corresponde aos filtros."}
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-3">
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ticket, index) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSelect={setSelected}
                delay={index * 60}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
