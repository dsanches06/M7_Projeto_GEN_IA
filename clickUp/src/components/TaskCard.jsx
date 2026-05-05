export function TaskCard({ task }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4 hover:border-[#444444] transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold flex-1">{task.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          task.priority === 'alta' ? 'bg-red-900 text-red-300' :
          task.priority === 'média' ? 'bg-yellow-900 text-yellow-300' :
          'bg-green-900 text-green-300'
        }`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            task.status === 'concluída' ? 'bg-green-900 text-green-300' :
            task.status === 'em progresso' ? 'bg-blue-900 text-blue-300' :
            'bg-gray-800 text-gray-300'
          }`}>
            {task.status}
          </span>
          <span className="text-gray-500 text-xs">👤 {task.assignee}</span>
        </div>
        <span className="text-gray-500 text-xs">{task.dueDate}</span>
      </div>
    </div>
  );
}
