import { getPriorityBadgeStyle, getStatusBadgeStyle } from '@/utils/utils';

const TAG_COLOR_HEX = {
  Red:    { bg: '#FEE2E2', text: '#DC2626' },
  Green:  { bg: '#DCFCE7', text: '#16A34A' },
  Blue:   { bg: '#DBEAFE', text: '#2563EB' },
  Orange: { bg: '#FEF3C7', text: '#D97706' },
  Purple: { bg: '#F3E8FF', text: '#9333EA' },
  Grey:   { bg: '#F3F4F6', text: '#6B7280' },
};

function TagBadge({ tag }) {
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

export function TaskCard({ task }) {
  const priorityStyle = getPriorityBadgeStyle(task.priority);
  const statusStyle   = getStatusBadgeStyle(task.status);
  const hasTags       = Array.isArray(task.tags) && task.tags.length > 0;

  return (
    <div className="bg-surface-2 border border-surface rounded-lg p-4 hover:border-surface-strong transition animate-fadeIn flex flex-col gap-2">

      {/* Title + Priority */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-main font-semibold text-sm leading-snug flex-1">{task.title}</h3>
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0"
          style={priorityStyle}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-muted text-xs line-clamp-2">{task.description}</p>
      )}

      {/* Tags */}
      {hasTags && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      {/* Footer: status + assignee + date */}
      <div className="flex items-center justify-between mt-auto pt-1 border-t border-surface">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
            style={statusStyle}
          >
            {task.status}
          </span>
          {task.assigneeName && (
            <span className="text-muted text-xs truncate">
              👤 {task.assigneeName}
            </span>
          )}
        </div>
        <span className="text-muted text-xs flex-shrink-0 ml-2">{task.dueDate}</span>
      </div>
    </div>
  );
}
