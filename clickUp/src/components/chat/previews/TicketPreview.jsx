/**
 * Componente de Preview de Ticket
 * Exibe cartões visuais para criação, atualização de estado e eliminação de tickets.
 */

import { getSeverityColor } from "@/utils/chatUtils";

/**
 * Mostra o resultado de uma ação sobre um ticket (criado, eliminado ou estado alterado)
 * @param {Object} props.ticket   - Objeto do ticket com _type, id, status, severity e user_report
 * @param {Function} props.onNavigate - Callback para navegar para a página de tickets
 */
export function TicketPreview({ ticket, onNavigate }) {

  /* Cartão para ticket eliminado */
  if (ticket._type === "ticket_deleted") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span>🗑️</span>
          <span className="text-xs font-bold text-red-700">
            Ticket #{ticket.id} eliminado
          </span>
        </div>
      </div>
    );
  }

  /* Cartão para alteração de estado do ticket */
  if (ticket._type === "ticket_status") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span>🔄</span>
          <span className="text-xs font-bold text-blue-700">
            Ticket #{ticket.id} → {ticket.status}
          </span>
        </div>
        <button
          onClick={onNavigate}
          className="mt-2 w-full text-xs bg-[var(--primary)] text-white rounded-lg py-1.5 hover:bg-[var(--primary-hover)]"
        >
          Ver Tickets →
        </button>
      </div>
    );
  }

  /* Cartão padrão para ticket criado ou atualizado */
  const sev   = ticket.severity || 5;
  const color = getSeverityColor(sev);

  return (
    <div
      className="rounded-xl border bg-white p-3 shadow-sm"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Cabeçalho com ID e badge de severidade */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-gray-400">Ticket #{ticket.id}</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${color}18`, color }}
        >
          Sev. {sev}/10
        </span>
      </div>

      {/* Descrição do problema */}
      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{ticket.user_report}</p>

      {/* Botão de navegação para a página de tickets */}
      <button
        onClick={onNavigate}
        className="w-full text-xs bg-[var(--primary)] text-white rounded-lg py-1.5 hover:bg-[var(--primary-hover)]"
      >
        Ver página de Tickets →
      </button>
    </div>
  );
}
