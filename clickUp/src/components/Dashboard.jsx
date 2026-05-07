import { TaskCard } from '@/components/TaskCard';

export function Dashboard({ tasks = [], onTasksUpdate = () => {} }) {
  const defaultTasks = [
    {
      id: 1,
      title: 'Implementar autenticação',
      description: 'Criar sistema de login e registro',
      status: 'em progresso',
      priority: 'alta',
      assignee: 'João',
      dueDate: '2026-05-10'
    },
    {
      id: 2,
      title: 'Design UI do dashboard',
      description: 'Criar interface do painel principal',
      status: 'concluída',
      priority: 'média',
      assignee: 'Maria',
      dueDate: '2026-05-05'
    },
    {
      id: 3,
      title: 'Integração com API',
      description: 'Conectar frontend com backend',
      status: 'a fazer',
      priority: 'alta',
      assignee: 'Pedro',
      dueDate: '2026-05-15'
    },
    {
      id: 4,
      title: 'Testes unitários',
      description: 'Escrever testes para componentes',
      status: 'a fazer',
      priority: 'média',
      assignee: 'Ana',
      dueDate: '2026-05-20'
    }
  ];

  // Usar tarefas passadas ou padrão
  const allTasks = tasks && tasks.length > 0 ? tasks : defaultTasks;

  // Estatísticas
  const stats = {
    total: allTasks.length,
    inProgress: allTasks.filter(t => t.status === 'em progresso').length,
    completed: allTasks.filter(t => t.status === 'concluída').length,
    todo: allTasks.filter(t => t.status === 'a fazer').length
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-6">
        <div className="mb-8">
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

            {allTasks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allTasks.map(task => (
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
    </main>
  );
}
