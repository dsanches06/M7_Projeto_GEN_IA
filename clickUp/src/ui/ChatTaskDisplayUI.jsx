/**
 * ChatTaskDisplayUI - Exibe dados de tarefa detectada
 * Padrão: Componente UI reutilizável
 */
export function ChatTaskDisplayUI({ taskData }) {
  if (!taskData) return null;

  return (
    <div className="border-t border-[#333333] px-6 py-4 bg-[#1a1a1a]">
      <p className="text-gray-400 text-xs mb-2">📋 Tarefa Detectada:</p>
      <div className="bg-[#2a2a2a] p-3 rounded text-sm text-gray-300 border-l-2 border-blue-500 space-y-1">
        <p>
          <strong>Título:</strong>{' '}
          <span className="text-blue-300">{taskData.task || taskData.title || 'N/A'}</span>
        </p>
        <p>
          <strong>Prioridade:</strong>{' '}
          <span className={
            taskData.priority?.toUpperCase() === 'ALTA' || taskData.priority?.toUpperCase() === 'URGENT'
              ? 'text-red-400'
              : taskData.priority?.toUpperCase() === 'MÉDIA'
              ? 'text-yellow-400'
              : 'text-green-400'
          }>
            {taskData.priority || 'N/A'}
          </span>
        </p>
        <p>
          <strong>Data:</strong>{' '}
          <span className="text-gray-300">{taskData.dueDate || 'N/A'}</span>
        </p>
        {taskData.description && (
          <p>
            <strong>Descrição:</strong>{' '}
            <span className="text-gray-300">{taskData.description}</span>
          </p>
        )}
      </div>
    </div>
  );
}
