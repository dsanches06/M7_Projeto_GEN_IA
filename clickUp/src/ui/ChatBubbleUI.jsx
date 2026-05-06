/**
 * ChatBubbleUI - Renderiza uma bolha de mensagem
 * Padrão: Componente UI reutilizável
 */
export function ChatBubbleUI({ message, sender }) {
  const isBot = sender === 'bot';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div
        className={`max-w-xs px-4 py-3 rounded-lg ${
          isBot
            ? 'bg-surface-3 text-secondary rounded-bl-none'
            : 'bg-[var(--primary)] text-white rounded-br-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        {message.timestamp && (
          <p className="text-xs mt-1 opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  );
}
