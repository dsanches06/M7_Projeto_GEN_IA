/**
 * ChatMessage.jsx
 * Componente para renderizar uma mensagem individual do chat
 * Padrão: Component para renderização de mensagem única
 */

export function ChatMessage({ message, sender, timestamp }) {
  const isBot = sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fadeIn`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg flex items-end gap-2 ${
        isBot 
          ? 'bg-[#2a2a2a] text-gray-300 rounded-bl-none' 
          : 'bg-blue-600 text-white rounded-br-none'
      }`}>
        <div className="flex-1">
          <p className="text-sm leading-relaxed break-words">{message}</p>
          {timestamp && (
            <span className={`text-xs mt-1 block ${isBot ? 'text-gray-500' : 'text-blue-200'}`}>
              {new Date(timestamp).toLocaleTimeString('pt-PT', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
