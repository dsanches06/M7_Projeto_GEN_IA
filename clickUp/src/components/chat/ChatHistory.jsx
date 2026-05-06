/**
 * ChatHistory.jsx
 * Componente para exibir o histórico de mensagens
 * Padrão: Container com scroll automático para última mensagem
 */

import { useEffect, useRef } from 'react';
import ChatMessage from '@/components/chat/ChatMessage';

export function ChatHistory({ messages = [], loading = false }) {
  const messagesEndRef = useRef(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-page">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <p className="text-2xl mb-2">👋</p>
            <p className="text-muted text-sm">
              Nenhuma mensagem ainda. Comece a conversa!
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg.text} 
              sender={msg.sender}
              timestamp={msg.timestamp}
            />
          ))}
        </>
      )}

      {loading && (
        <div className="flex justify-start mb-4">
          <div className="bg-surface-3 text-secondary px-4 py-3 rounded-lg rounded-bl-none">
            <div className="flex gap-2 items-center">
              <span className="text-xs">Processando...</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatHistory;
