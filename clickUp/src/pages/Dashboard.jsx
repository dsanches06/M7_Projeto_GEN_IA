import { useState } from "react";
import { TaskCard } from "@/components/tasks/TaskCard";
import TrophySpin from "@/components/ui/TrophySpin";
import totalIcon     from "../assets/tarefa.png";
import progressIcon  from "../assets/projeto_on_going.png";
import completedIcon from "../assets/tarefa-concluida.png";
import todoIcon      from "../assets/filtrar-tarefas.png";
import filterIcon    from "../assets/filtrar-tarefas.png";

export function Dashboard({
  tasks          = [],
  onTasksUpdate  = () => {},
  tasksLoading   = false,
  tasksError     = null,
  onRetryLoadTasks = () => {},
}) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [sortDir,      setSortDir]      = useState("NONE"); // NONE | ASC | DESC (by priority)

  /* ── Derived counts ── */
  const allTasks   = tasks || [];
  const inProgress = allTasks.filter((t) => t.status === "em progresso").length;
  const completed  = allTasks.filter((t) => t.status === "concluída").length;
  const todo       = allTasks.filter((t) => t.status === "a fazer").length;

  const statCards = [
    { label: "Tarefas Totais", value: allTasks.length,  icon: totalIcon,     filter: "ALL" },
    { label: "Em Progresso",   value: inProgress,        icon: progressIcon,  filter: "IN_PROGRESS" },
    { label: "Concluídas",     value: completed,          icon: completedIcon, filter: "COMPLETED" },
    { label: "A Fazer",        value: todo,               icon: todoIcon,      filter: "TODO" },
    { label: "Filtradas",      value: 0,                  icon: filterIcon,    filter: null }, // filled below
  ];

  /* ── Filter by status ── */
  const byStatus = statusFilter === "ALL"
    ? allTasks
    : allTasks.filter((t) => {
        if (statusFilter === "IN_PROGRESS") return t.status === "em progresso";
        if (statusFilter === "COMPLETED")   return t.status === "concluída";
        if (statusFilter === "TODO")        return t.status === "a fazer";
        return true;
      });

  /* ── Filter by search ── */
  const bySearch = search.trim()
    ? byStatus.filter(
        (t) =>
          (t.title       || "").toLowerCase().includes(search.toLowerCase()) ||
          (t.description || "").toLowerCase().includes(search.toLowerCase()),
      )
    : byStatus;

  /* ── Sort by priority ── */
  const PRIORITY_ORDER = { alta: 3, média: 2, baixa: 1 };
  const sorted = [...bySearch].sort((a, b) => {
    if (sortDir === "ASC")
      return (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
    if (sortDir === "DESC")
      return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
    /* default: newest first */
    const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
    const bDate = new Date(b.created_at || b.createdAt || 0).getTime();
    return bDate - aDate || (b.id ?? 0) - (a.id ?? 0);
  });

  /* ── Update "filtradas" count ── */
  statCards[4].value = sorted.length;

  /* ── Cycle sort ── */
  function cycleSortDir() {
    setSortDir((d) => (d === "NONE" ? "ASC" : d === "ASC" ? "DESC" : "NONE"));
  }

  const filterLabel =
    statusFilter === "IN_PROGRESS" ? "Em Progresso"
    : statusFilter === "COMPLETED" ? "Concluídas"
    : statusFilter === "TODO"      ? "A Fazer"
    : "Todas";

  if (tasksError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-main mb-2">Dashboard</h2>
          <p className="text-muted">Bem-vindo ao seu espaço de trabalho</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-surface bg-surface-2 p-6 text-center w-full max-w-md mx-auto">
          <TrophySpin message="Servidor indisponível" />
          <div>
            <p className="text-lg font-semibold text-main">Não foi possível carregar as tarefas</p>
            <p className="text-sm text-muted">Toque em recarregar para tentar novamente.</p>
          </div>
          <button
            type="button"
            onClick={onRetryLoadTasks}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ↺ Recarregar tarefas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-main mb-2">Dashboard</h2>
        <p className="text-muted">Bem-vindo ao seu espaço de trabalho</p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statCards.map(({ label, value, icon, filter }, index) => {
            const isSelected = filter && statusFilter === filter;
            const buttonClass = filter
              ? "cursor-pointer hover:bg-surface-2"
              : "cursor-default";
            return (
              <button
                key={label}
                type="button"
                onClick={() => filter && setStatusFilter(filter)}
                className={`flex items-center gap-3 rounded-3xl p-2 text-left transition-colors animate-fadeIn ${buttonClass} ${
                  isSelected
                    ? "bg-surface-2 border border-surface"
                    : "bg-surface"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <img
                  src={icon}
                  alt={label}
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="ml-auto flex items-center gap-2">
            {showSearch && (
              <input
                autoFocus
                className="h-8 bg-surface border border-surface rounded-lg px-3 text-sm text-main placeholder:text-muted focus:outline-none focus:border-[var(--primary)] w-48 transition-all"
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
              title="Ordenar por prioridade"
              onClick={cycleSortDir}
              className="w-8 h-8 rounded-lg border border-surface bg-surface flex items-center justify-center text-muted hover:bg-surface-2 transition-colors cursor-pointer"
            >
              {sortDir === "ASC" ? "⬆" : sortDir === "DESC" ? "⬇" : "⇅"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tasks section ── */}
      <section className="bg-surface-2 border border-surface rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-main">Minhas Tarefas</h3>
            <p className="text-muted mt-1 max-w-2xl text-sm">
              Use o ChatBot 🤖 ao lado para criar novas tarefas utilizando
              inteligência artificial.
            </p>
          </div>
          <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-3 whitespace-nowrap">
            Filtro: {filterLabel}
          </span>
        </div>

        {tasksLoading ? (
          <div className="py-12">
            <TrophySpin message="A carregar tarefas..." />
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {sorted.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-3 border border-surface rounded-2xl p-8 text-center">
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
