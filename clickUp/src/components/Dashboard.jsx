import { useState } from "react";
import { TaskCard } from '@/components/TaskCard';
import totalIcon from "../assets/tarefa.png";
import progressIcon from "../assets/projeto_on_going.png";
import completedIcon from "../assets/tarefa-concluida.png";
import todoIcon from "../assets/filtrar-tarefas.png";

export function Dashboard({ tasks = [], onTasksUpdate = () => {} }) {
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
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-main mb-2">Dashboard</h2>
        <p className="text-muted">Bem-vindo ao seu espaço de trabalho</p>
      </div>

      <div className="grid gap-6">
        <section className="bg-surface-2 border border-surface rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon, filter }) => {
              const isSelected = statusFilter === filter;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`flex items-center gap-4 rounded-3xl p-5 text-left transition-colors min-h-[150px] ${
                    isSelected ? "bg-surface-2 border border-surface" : "bg-surface"
                  }`}
                >
                  <img src={icon} alt={label} className="w-10 h-10 object-contain" />
                  <div className="min-w-0">
                    <p className="text-muted text-sm mb-1">{label}</p>
                    <p className="text-3xl font-semibold text-main">{value}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

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
