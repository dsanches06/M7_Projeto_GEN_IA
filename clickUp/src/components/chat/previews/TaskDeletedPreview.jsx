/**
 * Componente de Preview de Tarefa Eliminada
 * Exibe um cartão visual confirmando a eliminação de uma tarefa pelo bot.
 */

/**
 * Mostra o título e ID da tarefa que foi eliminada
 * @param {Object} props.taskDeleted - Objeto com id e title da tarefa eliminada
 */
export function TaskDeletedPreview({ taskDeleted }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
      {/* Cabeçalho com ícone de lixo */}
      <div className="flex items-center gap-2 mb-1.5">
        <span>🗑️</span>
        <span className="text-xs font-bold text-red-700">Tarefa eliminada</span>
      </div>
      {/* Título ou fallback com ID */}
      <p className="text-xs font-semibold text-gray-700 truncate">
        {taskDeleted.title || `Tarefa #${taskDeleted.id}`}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">ID #{taskDeleted.id}</p>
    </div>
  );
}
