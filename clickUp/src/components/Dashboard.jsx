import { TaskCard } from './TaskCard';

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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header da página */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-gray-400">Bem-vindo ao seu espaço de trabalho</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Tarefas Totais</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Em Progresso</p>
            <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Concluídas</p>
            <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">A Fazer</p>
            <p className="text-3xl font-bold text-gray-400">{stats.todo}</p>
          </div>
        </div>

        {/* Seção de tarefas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Minhas Tarefas</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              + Nova Tarefa
            </button>
          </div>

          {allTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-8 text-center">
              <p className="text-gray-400">Nenhuma tarefa ainda. Use o ChatBot para criar uma! 🤖</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
