import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';

export function ChatMessage({ message, sender }) {
  const isBot = sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        isBot 
          ? 'bg-surface-3 text-secondary rounded-bl-none' 
          : 'bg-[var(--primary)] text-white rounded-br-none'
      }`}>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

export function ChatInput({ onSendMessage, disabled = false }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Descreva sua tarefa ou comando..."
        disabled={disabled}
        className="flex-1 bg-surface-3 text-main border border-surface rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[var(--primary)] disabled:opacity-50 placeholder:text-muted"
        rows={3}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50 self-end"
      >
        {disabled ? '⏳' : '📤'}
      </button>
    </div>
  );
}

export function Chat({ onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! 👋 Sou o TaskBot. Descreve uma tarefa em linguagem natural e vou ajudar-te a organizá-la. Ex: 'Adiciona uma tarefa urgente para rever código amanhã'",
      sender: 'bot'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [lastTask, setLastTask] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (userMessage) => {
    // Adicionar mensagem do utilizador
    const userMsg = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user'
    };
    setMessages([...messages, userMsg]);
    setLoading(true);

    try {
      // Enviar para o chatService
      const response = await chatService.sendMessage(
        userMessage,
        messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
      );

      // Adicionar resposta do bot
      const botMsg = {
        id: messages.length + 2,
        text: response.message || response.content || "Desculpa, não consegui processar isso.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMsg]);

      // Tentar extrair dados de tarefa
      const taskData = chatService.extractTaskData(response.message || response.content);
      if (taskData) {
        setLastTask(taskData);
        
        // Notificar pai que uma tarefa foi criada
        if (onTaskCreated) {
          onTaskCreated(taskData);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: messages.length + 2,
        text: "❌ Erro ao processar mensagem. Tenta novamente!",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-lg border border-[#333333]">
      {/* Header */}
      <div className="border-b border-[#333333] px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>💬</span> TaskBot AI
        </h2>
        <p className="text-gray-400 text-sm mt-1">Gestor inteligente de tarefas</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg.text} sender={msg.sender} />
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#2a2a2a] text-gray-300 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Last Task Display */}
      {lastTask && (
        <div className="border-t border-[#333333] px-6 py-4 bg-[#0d0d0d]">
          <p className="text-gray-400 text-xs mb-2">📋 Última tarefa detectada:</p>
          <div className="bg-[#2a2a2a] p-3 rounded text-sm text-gray-300 border-l-2 border-blue-500">
            <p><strong>Título:</strong> {lastTask.task || lastTask.title || 'N/A'}</p>
            <p><strong>Prioridade:</strong> {lastTask.priority || 'N/A'}</p>
            <p><strong>Data:</strong> {lastTask.dueDate || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-[#333333] px-6 py-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
