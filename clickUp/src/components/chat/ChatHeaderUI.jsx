// Cabeçalho do modal de chat com avatar do bot e botão de fechar
export function ChatHeaderUI({ onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[var(--primary)] text-white rounded-t-3xl shadow-lg">
      <div className="flex items-center gap-3">
        {/* Avatar do assistente */}
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h2 className="text-lg font-bold">Support Assistant</h2>
          {/* Indicador de estado online */}
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-300 inline-block" />
            <span>Online</span>
          </div>
        </div>
      </div>
      {/* Botão para fechar o chat */}
      <button
        onClick={onClose}
        className="text-white/90 hover:text-white transition text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        aria-label="Fechar chat"
      >
        ✕
      </button>
    </div>
  );
}
