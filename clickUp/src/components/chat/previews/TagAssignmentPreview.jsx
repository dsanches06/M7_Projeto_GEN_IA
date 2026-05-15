// Cartão de confirmação das etiquetas adicionadas a uma tarefa pelo bot
export function TagAssignmentPreview({ tagAssignment }) {
  const { task_id, task_title, added = [] } = tagAssignment;

  return (
    <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-3 shadow-sm">
      {/* Cabeçalho com contagem dinâmica de etiquetas */}
      <div className="flex items-center gap-2 mb-2.5">
        <span>🏷️</span>
        <span className="text-xs font-bold text-[#7C3AED]">
          Etiqueta{added.length !== 1 ? "s" : ""} adicionada{added.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Linha da tarefa */}
      <div className="flex items-start gap-2 mb-2.5">
        <span className="text-[10px] text-gray-400 w-12 flex-shrink-0 pt-0.5">Tarefa</span>
        <div>
          <p className="text-xs font-semibold text-gray-800 truncate">
            {task_title || `Tarefa #${task_id}`}
          </p>
          <p className="text-[10px] text-gray-400">ID #{task_id}</p>
        </div>
      </div>

      {/* Badges coloridos de cada etiqueta */}
      {added.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {added.map((tag) => (
            <span
              key={tag.tag_id}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${tag.tag_color}18`,
                color:  tag.tag_color,
                border: `1px solid ${tag.tag_color}40`,
              }}
            >
              {/* Ponto colorido da etiqueta */}
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.tag_color }} />
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
