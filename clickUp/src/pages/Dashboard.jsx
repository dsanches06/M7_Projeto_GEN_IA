import { useState } from "react";
import { TaskCard } from '@/components/tasks/TaskCard';
import totalIcon from "../assets/tarefa.png";
import progressIcon from "../assets/projeto_on_going.png";
import completedIcon from "../assets/tarefa-concluida.png";
import todoIcon from "../assets/filtrar-tarefas.png";

export function Dashboard({ tasks = [], onTasksUpdate = () => {}, tasksLoading = false, tasksError = null, onRetryLoadTasks = () => {} }) {
  const allTasks = tasks || [];
  const [statusFilter, setStatusFilter] = useState("ALL");

  const sortedTasks = [...allTasks].sort((a, b) => {
    const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
    const bDate = new Date(b.created_at || b.createdAt || 0).getTime();

    if (aDate && bDate) {
      return bDate - aDate;
    }

    return (b.id ?? 0) - (a.id ?? 0);
  });

  const stats = {
    total: sortedTasks.length,
    inProgress: sortedTasks.filter(t => t.status === 'em progresso').length,
    completed: sortedTasks.filter(t => t.status === 'concluída').length,
    todo: sortedTasks.filter(t => t.status === 'a fazer').length,
  };

  const statCards = [
    {
      label: "Tarefas Totais",
      value: stats.total,
      icon: totalIcon,
      filter: "ALL",
    },
    {
      label: "Em Progresso",
      value: stats.inProgress,
      icon: progressIcon,
      filter: "IN_PROGRESS",
    },
    {
      label: "Concluídas",
      value: stats.completed,
      icon: completedIcon,
      filter: "COMPLETED",
    },
    {
      label: "A Fazer",
      value: stats.todo,
      icon: todoIcon,
      filter: "TODO",
    },
  ];

  const filteredTasks =
    statusFilter === "ALL"
      ? sortedTasks
      : sortedTasks.filter((task) => {
          if (statusFilter === "IN_PROGRESS") return task.status === "em progresso";
          if (statusFilter === "COMPLETED") return task.status === "concluída";
          if (statusFilter === "TODO") return task.status === "a fazer";
          return true;
        });

  const filterLabel =
    statusFilter === "ALL"
      ? "Todas"
      : statusFilter === "IN_PROGRESS"
      ? "Em Progresso"
      : statusFilter === "COMPLETED"
      ? "Concluídas"
      : "A Fazer";

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6 animate-fadeInUp">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-main mb-2">Dashboard</h2>
        <p className="text-muted">Bem-vindo ao seu espaço de trabalho</p>
      </div>

      {tasksError && (
        <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-600/10 p-5 text-red-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold">Servidor indisponível</p>
              <p className="text-sm text-red-100/90">Erro ao carregar tarefas: {tasksError}</p>
            </div>
            <button
              type="button"
              onClick={onRetryLoadTasks}
              className="rounded-full border border-red-200/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
            >
              Recarregar tarefas
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 mb-6 flex-wrap lg:flex-row lg:items-center">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
            {statCards.map(({ label, value, icon, filter }, index) => {
              const isSelected = statusFilter === filter;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`flex items-center gap-4 rounded-3xl p-2 text-left transition-colors focus:outline-none animate-fadeIn ${
                    isSelected ? "bg-surface-2 border border-surface" : "bg-surface"
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <img src={icon} alt={label} className="w-8 h-8 object-contain" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted uppercase tracking-[0.08em]">
                      {label}
                    </p>
                    <p className="text-base font-semibold text-main">{value}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-2 lg:ml-auto">
            Filtro: {filterLabel}
          </span>
        </div>

        <section className="bg-surface-2 border border-surface rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-main">Minhas Tarefas</h3>
              <p className="text-muted mt-2 max-w-2xl">
                Use o ChatBot 🤖 ao lado para criar novas tarefas utilizando inteligência artificial.
              </p>
            </div>
            <span className="text-xs text-muted px-3 py-1 rounded-full border border-surface bg-surface-3">
              Filtro: {filterLabel}
            </span>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-3 border border-surface rounded-2xl p-8 text-center">
              <p className="text-muted">Nenhuma tarefa ainda. Use o ChatBot para criar uma! 🤖</p>
            </div>
          )}
        </section>
      </div>
      </div>
  );
}
