import { useState, useRef, useEffect } from 'react';
import { botService } from '@/services/botService';

/**
 * Componente de Chat com Bot GenAI
 * Envia mensagens e executa function calls
 */
export function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Fazer scroll para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Enviar mensagem para o bot
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setLoading(true);

    // Adicionar mensagem do usuário ao chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        sender: 'user',
        timestamp: new Date(),
      },
    ]);

    try {
      // Enviar para o bot
      const response = await botService.sendMessageToBot(
        userMessage,
        conversationHistory
      );

      if (!response.success) {
        throw new Error(response.error || 'Erro ao processar mensagem');
      }

      // Adicionar resposta do bot ao chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(),
          functionResults: response.functionResults,
        },
      ]);

      // Atualizar histórico da conversa
      if (response.updatedHistory) {
        setConversationHistory(response.updatedHistory);
      }
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Erro: ${err.message}`,
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Criar tarefa a partir do resultado da função
   */
  const handleCreateTask = async (functionResult) => {
    try {
      const taskData = botService.extractTaskDataFromFunctionResult(
        functionResult
      );

      if (!taskData) {
        throw new Error('Não foi possível extrair dados da tarefa');
      }

      // Fazer fetch para criar a tarefa (você pode adaptar o endpoint)
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const createdTask = await response.json();

      // Adicionar mensagem de sucesso
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `✅ Tarefa criada com sucesso: "${createdTask.title}"`,
          sender: 'system',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 rounded-lg border border-surface">
      {/* Header */}
      <div className="bg-[var(--primary)] text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Bot GenAI</h2>
        <p className="text-sm opacity-90">Descreva tarefas e o bot criará automaticamente</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted">
            <div className="text-center">
              <p className="mb-2">💬 Nenhuma mensagem ainda</p>
              <p className="text-sm">Comece digitando uma mensagem abaixo</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-[var(--primary)] text-white rounded-br-none'
                    : msg.sender === 'system'
                    ? 'bg-green-100 text-green-800 rounded-bl-none'
                    : msg.isError
                    ? 'bg-red-100 text-red-800 rounded-bl-none'
                    : 'bg-surface-3 text-secondary rounded-bl-none'
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>

                {/* Function Results */}
                {msg.functionResults && msg.functionResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.functionResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-white bg-opacity-20 p-2 rounded text-xs"
                      >
                        <p className="font-semibold mb-1">
                          Função: {result.functionName}
                        </p>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                        <button
                          onClick={() => handleCreateTask(result)}
                          className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                        >
                          ✅ Criar Tarefa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mx-4 rounded mb-2 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-surface p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Descreva a tarefa que deseja criar..."
            disabled={loading}
            className="flex-1 bg-surface-3 text-main border border-surface rounded-lg px-4 py-2 resize-none focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[var(--primary)] hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition h-fit"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatBot;
