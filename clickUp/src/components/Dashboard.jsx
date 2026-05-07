import { TaskCard } from '@/components/TaskCard';

export function Dashboard({ tasks = [], onTasksUpdate = () => {} }) {
  const allTasks = tasks || [];

  const sortedTasks = [...allTasks].sort((a, b) => {
    const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
    const bDate = new Date(b.created_at || b.createdAt || 0).getTime();

    if (aDate && bDate) {
      return bDate - aDate;
    }

    return (b.id ?? 0) - (a.id ?? 0);
  });

  // Estatísticas
  const stats = {
    total: sortedTasks.length,
    inProgress: sortedTasks.filter(t => t.status === 'em progresso').length,
    completed: sortedTasks.filter(t => t.status === 'concluída').length,
    todo: sortedTasks.filter(t => t.status === 'a fazer').length
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-main mb-2">Dashboard</h2>
        <p className="text-muted">Bem-vindo ao seu espaço de trabalho</p>
      </div>

      <div className="grid gap-6">
        <section className="bg-surface-2 border border-surface rounded-3xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-surface-3 border border-surface rounded-2xl p-5">
              <p className="text-muted text-sm mb-3">Tarefas Totais</p>
              <p className="text-3xl font-bold text-main">{stats.total}</p>
            </div>
            <div className="bg-surface-3 border border-surface rounded-2xl p-5">
              <p className="text-muted text-sm mb-3">Em Progresso</p>
              <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="bg-surface-3 border border-surface rounded-2xl p-5">
              <p className="text-muted text-sm mb-3">Concluídas</p>
              <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
            </div>
            <div className="bg-surface-3 border border-surface rounded-2xl p-5">
              <p className="text-muted text-sm mb-3">A Fazer</p>
              <p className="text-3xl font-bold text-muted">{stats.todo}</p>
            </div>
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
          </div>

          {sortedTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {sortedTasks.map(task => (
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
