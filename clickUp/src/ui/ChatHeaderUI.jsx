/**
 * ChatHeaderUI - Header do ChatUI Modal
 * Padrão: Componente UI reutilizável
 */
export function ChatHeaderUI({ onClose }) {
  return (
    <div className="border-b border-surface px-6 py-4 flex items-center justify-between bg-surface-2">
      <div>
        <h2 className="text-lg font-bold text-main flex items-center gap-2">
          <span className="text-2xl">🤖</span> TaskBot AI
        </h2>
        <p className="text-muted text-xs mt-1">Gestor inteligente de tarefas</p>
      </div>
      <button
        onClick={onClose}
        className="text-muted hover:text-main transition text-2xl hover:bg-surface-3 w-10 h-10 flex items-center justify-center rounded"
      >
        ✕
      </button>
    </div>
  );
}
