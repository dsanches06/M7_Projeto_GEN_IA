import { getPriorityBadgeStyle, getStatusBadgeStyle } from '@/utils/utils';

// Mapa de cores por nome de cor (usado nas etiquetas de tarefas)
const TAG_COLOR_HEX = {
  Red:    { bg: '#FEE2E2', text: '#DC2626' },
  Green:  { bg: '#DCFCE7', text: '#16A34A' },
  Blue:   { bg: '#DBEAFE', text: '#2563EB' },
  Orange: { bg: '#FEF3C7', text: '#D97706' },
  Purple: { bg: '#F3E8FF', text: '#9333EA' },
  Grey:   { bg: '#F3F4F6', text: '#6B7280' },
};

// Badge colorido de etiqueta (tag) de uma tarefa
function TagBadge({ tag }) {
  // Usa cor cinzenta como fallback se a cor não estiver no mapa
  const colors = TAG_COLOR_HEX[tag.color] || TAG_COLOR_HEX.Grey;
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.text }}
      />
      {tag.name}
    </span>
  );
}

// Formata uma data para dd/mm, ignorando valores inválidos ou "N/A"
function formatDate(dateString) {
  if (!dateString) return '';
  const value = String(dateString).trim();
  if (!value || value.toUpperCase() === 'N/A') return '';

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });
  }

  // Fallback para formato dd/mm/yyyy ou dd-mm-yyyy
  const parts = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (parts) {
    return `${parts[1].padStart(2, '0')}/${parts[2].padStart(2, '0')}`;
  }

  return value;
}

// Cartão de tarefa com prioridade, estado, etiquetas, responsável e data
export function TaskCard({ task }) {
  // Estilos de badge calculados pela prioridade e estado
  const priorityStyle = getPriorityBadgeStyle(task.priority);
  const statusStyle   = getStatusBadgeStyle(task.status);
  const hasTags       = Array.isArray(task.tags) && task.tags.length > 0;
  const createdAt     = formatDate(task.created_at || task.createdAt);

  return (
    <div className="bg-surface-2 border border-surface rounded-lg p-4 hover:border-surface-strong transition animate-fadeIn flex flex-col gap-2">

      {/* Título e badge de prioridade */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-main font-semibold text-sm leading-snug flex-1">{task.title}</h3>
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
          style={priorityStyle}
        >
          {task.priority}
        </span>
      </div>

      {/* Descrição truncada a 2 linhas (visível apenas se existir) */}
      {task.description && (
        <p className="text-muted text-xs line-clamp-2">{task.description}</p>
      )}

      {/* Etiquetas da tarefa (visíveis apenas se existirem) */}
      {hasTags && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {/* Rodapé: estado, responsável e data de criação */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-surface">
        <div className="flex items-center gap-2 min-w-0">
          {/* Badge de estado */}
          <span
            className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
            style={statusStyle}
          >
            {task.status}
          </span>
          {/* Nome do responsável (visível apenas se atribuído) */}
          {task.assigneeName && (
            <span className="text-muted text-xs truncate">
              👤 {task.assigneeName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {/* Data de criação formatada */}
          {createdAt && (
            <span className="text-muted text-xs" title={`Criado em: ${task.created_at || task.createdAt}`}>
              📅 {createdAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
