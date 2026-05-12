/**
 * Componente de Preview de Atribuição de Tarefa
 * Exibe um cartão visual confirmando a atribuição de uma tarefa a um utilizador.
 */

/**
 * Mostra a tarefa atribuída e o utilizador destinatário
 * @param {Object} props.assignment - Objeto com task_id, task_title, user_id e user_name
 */
export function AssignmentPreview({ assignment }) {
  /* Inicial do nome do utilizador para o avatar circular */
  const initial = (assignment.user_name || "?").charAt(0).toUpperCase();

  return (
    <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 mb-2.5">
        <span>🔗</span>
        <span className="text-xs font-bold text-[#1D4ED8]">Atribuição confirmada</span>
      </div>

      {/* Linha da tarefa */}
      <div className="flex items-start gap-2">
        <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 pt-0.5">Tarefa</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {assignment.task_title || `Tarefa #${assignment.task_id}`}
          </p>
          <p className="text-[10px] text-gray-400">ID #{assignment.task_id}</p>
        </div>
      </div>

      <div className="border-t border-[#BFDBFE] my-2" />

      {/* Linha do utilizador com avatar */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-14 flex-shrink-0">Atribuído</span>
        <div className="w-5 h-5 rounded-full bg-[#BFDBFE] flex items-center justify-center text-[9px] font-bold text-[#1D4ED8] flex-shrink-0">
          {initial}
        </div>
        <p className="text-xs font-semibold text-gray-800 truncate flex-1">
          {assignment.user_name || `Utilizador #${assignment.user_id}`}
        </p>
        <span className="text-[10px] text-gray-400 flex-shrink-0">#{assignment.user_id}</span>
      </div>
    </div>
  );
}
