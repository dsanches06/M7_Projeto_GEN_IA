/**
 * EXEMPLOS DE USO DO BOT SERVICE
 * Diferentes formas de integrar o bot com function calls
 */

import { botService } from '@/services/botService';

// ============================================================
// EXEMPLO 1: Uso simples em um componente
// ============================================================

import { useState } from 'react';

export function ExampleSimple() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      const result = await botService.sendMessageToBot(
        'Crie uma tarefa para implementar login com prioridade alta'
      );
      setResponse(result);
      console.log('Resposta:', result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Mensagem'}
      </button>

      {response && (
        <div>
          <h3>Resposta do Bot:</h3>
          <p>{response.message}</p>

          {botService.hasFunctionResults(response) && (
            <div>
              <h4>Resultados das Funções:</h4>
              <pre>{JSON.stringify(response.functionResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EXEMPLO 2: Com histórico de conversa
// ============================================================

export function ExampleWithHistory() {
  const [messages, setMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleSendMessage = async (message) => {
    // Adicionar mensagem do usuário
    setMessages((prev) => [...prev, { text: message, sender: 'user' }]);

    try {
      // Enviar com histórico
      const result = await botService.sendMessageToBot(
        message,
        conversationHistory
      );

      // Adicionar resposta do bot
      setMessages((prev) => [...prev, { text: result.message, sender: 'bot' }]);

      // Atualizar histórico
      setConversationHistory(result.updatedHistory);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {messages.map((msg, idx) => (
        <div key={idx} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
          {msg.text}
        </div>
      ))}

      <button onClick={() => handleSendMessage('Sua mensagem aqui')}>
        Enviar
      </button>
    </div>
  );
}

// ============================================================
// EXEMPLO 3: Criar tarefa a partir da resposta do bot
// ============================================================

export function ExampleCreateTask() {
  const handleCreateTaskFromBot = async () => {
    try {
      // 1. Enviar mensagem para o bot
      const response = await botService.sendMessageToBot(
        'Crie uma tarefa para implementar autenticação OAuth'
      );

      if (!botService.hasFunctionResults(response)) {
        console.log('Nenhuma função foi executada');
        return;
      }

      // 2. Extrair resultado da função
      const functionResult = botService.getFirstFunctionResult(response);
      const taskData = botService.extractTaskDataFromFunctionResult(
        functionResult
      );

      // 3. Criar tarefa na API
      const taskResponse = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!taskResponse.ok) {
        throw new Error('Erro ao criar tarefa');
      }

      const createdTask = await taskResponse.json();
      console.log('Tarefa criada:', createdTask);
      alert(`Tarefa "${createdTask.title}" criada com sucesso!`);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <button onClick={handleCreateTaskFromBot}>
      🤖 Criar Tarefa via Bot
    </button>
  );
}

// ============================================================
// EXEMPLO 4: Em uma conversa específica
// ============================================================

export function ExampleSpecificConversation() {
  const conversationId = 123; // ID da conversa

  const handleSendToConversation = async (message) => {
    try {
      const result = await botService.sendMessageToConversation(
        conversationId,
        message
      );

      console.log('Resposta na conversa:', result);
      return result;
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <button
      onClick={() =>
        handleSendToConversation('Adicione mais detalhes a essa tarefa')
      }
    >
      Enviar na Conversa
    </button>
  );
}

// ============================================================
// EXEMPLO 5: Hook customizado para uso simplificado
// ============================================================

import { useCallback } from 'react';

export function useBot() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    setError(null);

    try {
      const response = await botService.sendMessageToBot(
        message,
        conversationHistory
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.updatedHistory) {
        setConversationHistory(response.updatedHistory);
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationHistory]);

  const resetConversation = useCallback(() => {
    setConversationHistory([]);
    setError(null);
  }, []);

  return {
    sendMessage,
    loading,
    error,
    conversationHistory,
    resetConversation,
  };
}

// Usar o hook:
export function ExampleUsingHook() {
  const { sendMessage, loading, error, resetConversation } = useBot();
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    try {
      const response = await sendMessage(message);
      console.log('Resposta:', response);
      setMessage('');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>

      {error && <div className="error">{error}</div>}

      <button onClick={resetConversation}>Limpar Conversa</button>
    </div>
  );
}
