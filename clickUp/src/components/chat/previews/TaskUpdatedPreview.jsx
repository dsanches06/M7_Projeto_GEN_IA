/**
 * Componente de Preview de Tarefa Atualizada
 * Exibe um cartão visual confirmando a atualização do estado de uma tarefa.
 */

import { TASK_STATUS_COLORS } from "@/utils/chatUtils";

/**
 * Mostra o novo estado da tarefa após atualização pelo bot
 * @param {Object} props.taskUpdated - Objeto com id, title e status_name da tarefa
 */
export function TaskUpdatedPreview({ taskUpdated }) {
  /* Determina cor com base no estado atual */
  const statusName = taskUpdated.status_name || "UPDATED";
  const color      = TASK_STATUS_COLORS[statusName] || "#6B7280";

  return (
    <div
      className="rounded-xl p-3 shadow-sm"
      style={{ border: `1px solid ${color}40`, background: `${color}12` }}
    >
      {/* Cabeçalho com ícone e label dinâmico */}
      <div className="flex items-center gap-2 mb-1.5">
        <span>🔄</span>
        <span className="text-xs font-bold" style={{ color }}>
          {statusName === "UPDATED" ? "Tarefa atualizada" : "Estado atualizado"}
        </span>
      </div>

      {/* Título da tarefa */}
      <p className="text-xs font-semibold text-gray-800 truncate">
        {taskUpdated.title || `Tarefa #${taskUpdated.id}`}
      </p>

      {/* Badge de estado (só quando o estado é explícito) */}
      {statusName !== "UPDATED" && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-bold" style={{ color }}>{statusName}</span>
          <span className="text-[10px] text-gray-400 ml-auto">ID #{taskUpdated.id}</span>
        </div>
      )}
    </div>
  );
}
