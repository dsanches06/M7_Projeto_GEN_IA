/**
 * ChatHeaderUI - Header do ChatUI Modal
 * Padrão: Componente UI reutilizável
 */
export function ChatHeaderUI({ onClose }) {
  return (
    <div className="border-b border-[#333333] px-6 py-4 flex items-center justify-between bg-[#1a1a1a]">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span> TaskBot AI
        </h2>
        <p className="text-gray-400 text-xs mt-1">Gestor inteligente de tarefas</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition text-2xl hover:bg-[#2a2a2a] w-10 h-10 flex items-center justify-center rounded"
      >
        ✕
      </button>
    </div>
  );
}
