// Cartão de confirmação exibido após a criação de uma tarefa pelo bot
export function TaskCreatedPreview({ task }) {
  return (
    <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-3 shadow-sm">
      {/* Cabeçalho com ícone e label */}
      <div className="flex items-center gap-2 mb-1.5">
        <span>✅</span>
        <span className="text-xs font-bold text-[#065F46]">Tarefa criada</span>
      </div>
      {/* Título da tarefa */}
      <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
      {/* ID da tarefa */}
      <p className="text-[10px] text-gray-400 mt-0.5">ID #{task.id}</p>
    </div>
  );
}
