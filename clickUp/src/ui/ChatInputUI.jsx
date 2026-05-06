import { useRef } from 'react';

/**
 * ChatInputUI - Input para enviar mensagens
 * Padrão: Componente UI reutilizável
 */
export function ChatInputUI({ value, onChange, onSubmit, disabled = false, inputRef }) {
  const localInputRef = useRef(null);
  const ref = inputRef || localInputRef;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-surface px-6 py-4 bg-surface-2">
      <div className="flex gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder="Digita tua tarefa aqui..."
          disabled={disabled}
          className="flex-1 bg-surface-3 text-main border border-surface rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 text-sm placeholder:text-muted"
          rows={2}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-4 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
        >
          {disabled ? '⏳' : '➤'}
        </button>
      </div>
      <p className="text-muted text-xs mt-2">
        💡 Dica: Usa Shift+Enter para nova linha
      </p>
    </form>
  );
}
