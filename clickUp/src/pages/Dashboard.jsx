import { useState } from "react";
import { TaskCard } from "@/components/tasks/TaskCard";
import TrophySpin from "@/components/ui/TrophySpin";
import totalIcon     from "../assets/tarefa.png";
import progressIcon  from "../assets/projeto_on_going.png";
import completedIcon from "../assets/tarefa-concluida.png";
import todoIcon      from "../assets/filtrar-tarefas.png";
import filterIcon    from "../assets/filtrar-tarefas.png";

// ── Stat Card atom ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, filter, currentFilter, onFilter, delay, className = "" }) {
  const isSelected = filter && currentFilter === filter;
  return (
    <button
      type="button"
      onClick={() => filter && onFilter(filter)}
      className={[
        "flex flex-col sm:flex-row items-center gap-1 sm:gap-3",
        "rounded-2xl sm:rounded-3xl p-2 sm:p-2 text-center sm:text-left transition-all animate-fadeIn",
        filter ? "cursor-pointer hover:bg-surface-2 active:scale-95" : "cursor-default",
        isSelected ? "bg-surface-2 border border-surface" : "bg-surface",
        className,
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <img src={icon} alt={label} className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0" />
      <div className="min-w-0 w-full sm:w-auto">
        <p className="hidden sm:block text-[10px] text-muted uppercase tracking-[0.06em] leading-tight">{label}</p>
        <p className="text-sm sm:text-base font-bold sm:font-semibold text-main">{value}</p>
        <p className="sm:hidden text-[9px] text-muted leading-tight truncate">{label}</p>
      </div>
    </button>
  );
}

export function Dashboard({
  tasks            = [],
  onTasksUpdate    = () => {},
  tasksLoading     = false,
  tasksError       = null,
  onRetryLoadTasks = () => {},
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [sortDir,      setSortDir]      = useState("NONE");

  const allTasks   = tasks || [];
  const inProgress = allTasks.filter((t) => t.status === "em progresso").length;
  const completed  = allTasks.filter((t) => t.status === "concluída").length;
  const todo       = allTasks.filter((t) => t.status === "a fazer").length;

  const statCards = [
    { label: "Total",        value: allTasks.length, icon: totalIcon,     filter: "ALL"         },
    { label: "Em Progresso", value: inProgress,       icon: progressIcon,  filter: "IN_PROGRESS" },
    { label: "Concluídas",   value: completed,         icon: completedIcon, filter: "COMPLETED"   },
    { label: "A Fazer",      value: todo,              icon: todoIcon,      filter: "TODO"        },
    { label: "Filtradas",    value: 0,                 icon: filterIcon,    filter: null          },
  ];

  const byStatus = statusFilter === "ALL"
    ? allTasks
    : allTasks.filter((t) => {
        if (statusFilter === "IN_PROGRESS") return t.status === "em progresso";
        if (statusFilter === "COMPLETED")   return t.status === "concluída";
        if (statusFilter === "TODO")        return t.status === "a fazer";
        return true;
      });

  const bySearch = search.trim()
    ? byStatus.filter((t) =>
        (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(search.toLowerCase()))
    : byStatus;

  const PRIORITY_ORDER = { alta: 3, média: 2, baixa: 1 };
  const sorted = [...bySearch].sort((a, b) => {
    if (sortDir === "ASC")  return (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
    if (sortDir === "DESC") return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
    const idA = a.id ?? 0;
    const idB = b.id ?? 0;
    if (idA !== idB) return idB - idA;
    const ad = new Date(a.created_at || a.createdAt || 0).getTime();
    const bd = new Date(b.created_at || b.createdAt || 0).getTime();
    return bd - ad;
  });

  statCards[4].value = sorted.length;

  const filterLabel =
    statusFilter === "IN_PROGRESS" ? "Em Progresso"
    : statusFilter === "COMPLETED" ? "Concluídas"
    : statusFilter === "TODO"      ? "A Fazer"
    : "Todas";

  if (tasksError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fadeInUp">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-main mb-1">Dashboard</h2>
          <p className="text-muted text-sm">Bem-vindo ao seu espaço de trabalho</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-surface bg-surface-2 p-6 text-center max-w-md mx-auto">
          <TrophySpin message="Servidor indisponível" />
          <p className="text-base font-semibold text-main">Não foi possível carregar as tarefas</p>
          <button type="button" onClick={onRetryLoadTasks}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white">
            ↺ Recarregar tarefas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fadeInUp">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-main mb-1">Dashboard</h2>
        <p className="text-muted text-sm">Bem-vindo ao seu espaço de trabalho</p>
      </div>

      <div className="flex flex-col gap-3 mb-4 sm:mb-6">

        {/* ── MOBILE: row 1 → 3 cards, row 2 → 2 cards (each = 50% width) ── */}
        <div className="sm:hidden space-y-2">
          {/* Row 1: 3 equal cards */}
          <div className="grid grid-cols-3 gap-2">
            {statCards.slice(0, 3).map((c, i) => (
              <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} delay={i * 60} />
            ))}
          </div>
          {/* Row 2: 2 cards, each half-width → fills the same total width as row 1 */}
          <div className="grid grid-cols-2 gap-2">
            {statCards.slice(3).map((c, i) => (
              <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} delay={(3 + i) * 60} />
            ))}
          </div>
        </div>

        {/* ── DESKTOP: all 5 in one row ── */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-2">
          {statCards.map((c, i) => (
            <StatCard key={c.label} {...c} currentFilter={statusFilter} onFilter={setStatusFilter} delay={i * 70} />
          ))}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 justify-end">
          {showSearch && (
            <input autoFocus
              className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] flex-1 min-w-0 sm:w-48 sm:flex-none"
              placeholder="Pesquisar tarefa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <span className="hidden sm:inline-flex text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2">
            Filtro: {filterLabel}
          </span>
          <button
            type="button"
            onClick={() => { setShowSearch((s) => !s); setSearch(""); }}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 cursor-pointer text-base flex-shrink-0"
          >
            ⌕
          </button>
          <button
            type="button"
            onClick={() => setSortDir((d) => d === "NONE" ? "ASC" : d === "ASC" ? "DESC" : "NONE")}
            className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 cursor-pointer flex-shrink-0"
          >
            {sortDir === "ASC" ? "⬆" : sortDir === "DESC" ? "⬇" : "⇅"}
          </button>
        </div>
      </div>

      {/* Tasks section */}
      <section className="bg-surface-2 border border-surface rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-main">Minhas Tarefas</h3>
            <p className="text-muted mt-1 text-xs sm:text-sm max-w-2xl">
              Use o ChatBot 🤖 para criar novas tarefas via inteligência artificial.
            </p>
          </div>
          <span className="self-start text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-3 whitespace-nowrap">
            {filterLabel}
          </span>
        </div>

        {tasksLoading ? (
          <div className="py-10 sm:py-12"><TrophySpin message="A carregar tarefas..." /></div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {sorted.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="bg-surface-3 border border-surface rounded-2xl p-6 sm:p-8 text-center">
            <p className="text-muted text-sm">
              {allTasks.length === 0
                ? "Nenhuma tarefa ainda. Use o ChatBot para criar uma! 🤖"
                : "Nenhuma tarefa corresponde aos filtros."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
