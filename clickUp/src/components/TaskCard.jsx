export function TaskCard({ task }) {
  return (
    <div className="bg-surface-2 border border-surface rounded-lg p-4 hover:border-surface-strong transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-main font-semibold flex-1">{task.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          task.priority === 'alta' ? 'bg-red-900 text-red-300' :
          task.priority === 'média' ? 'bg-yellow-900 text-yellow-300' :
          'bg-green-900 text-green-300'
        }`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-muted text-sm mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === 'concluída' ? 'bg-green-900 text-green-300' :
            task.status === 'em progresso' ? 'bg-blue-900 text-blue-300' :
            'bg-gray-800 text-gray-300'
          }`}>
            {task.status}
          </span>
          <span className="text-muted text-xs">👤 {task.assignee}</span>
        </div>
        <span className="text-muted text-xs">{task.dueDate}</span>
      </div>
    </div>
  );
}
