import { useState, useRef, useEffect } from 'react';
import { botService } from '@/services/botService';
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatTaskDisplayUI,
  ChatInputUI
} from '@/components/chat';

/**
 * ChatUI - Modal flutuante do ChatBot AI com GenAI Function Calls
 * Integrado com Dashboard para atualizar tarefas em tempo real
 * 
 * Padrão: Segue arquitetura de componentes do frontend original
 * Usa: botService para executar function calls automaticamente
 */
export function ChatUI({ isOpen, onClose, onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🤖 Olá! Sou o TaskBot AI com IA Generativa!\n\nDescreva uma tarefa em linguagem natural e vou criar automaticamente para você.\n\nExemplos:\n• 'Crie uma tarefa urgente para implementar login na próxima semana'\n• 'Tarefa de alta prioridade: corrigir bug do formulário'\n• 'Implementar autenticação com prioridade máxima'",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus no input quando abre
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Enviar para o bot com function calls
      const response = await botService.sendMessageToBot(
        input,
        conversationHistory
      );

      if (!response.success) {
        throw new Error(response.error || 'Erro ao processar mensagem');
      }

      // Adicionar resposta do bot
      const botMsg = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        functionResults: response.functionResults
      };
      setMessages(prev => [...prev, botMsg]);

      // Atualizar histórico da conversa
      if (response.updatedHistory) {
        setConversationHistory(response.updatedHistory);
      }

      // Se houver resultado de function call, criar tarefa
      if (botService.hasFunctionResults(response)) {
        const functionResult = botService.getFirstFunctionResult(response);
        handleCreateTaskFromFunction(functionResult);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: Date.now() + 1,
        text: `❌ Erro: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Criar tarefa a partir do resultado da função
   */
  const handleCreateTaskFromFunction = async (functionResult) => {
    try {
      const taskData = botService.extractTaskDataFromFunctionResult(
        functionResult
      );

      if (!taskData) {
        throw new Error('Não foi possível extrair dados da tarefa');
      }

      // Callback para criar tarefa no Dashboard
      if (onTaskCreated) {
        onTaskCreated({
          title: taskData.title,
          description: taskData.description,
          priority: getPriorityLabel(taskData.priority_id),
          dueDate: taskData.due_date ? taskData.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
          estimated_hours: taskData.estimated_hours
        });
      }

      // Adicionar mensagem de sucesso
      const successMsg = {
        id: Date.now() + 2,
        text: `✅ Tarefa "${taskData.title}" criada com sucesso!`,
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMsg]);
    } catch (error) {
      console.error('Error creating task:', error);
      const errorMsg = {
        id: Date.now() + 2,
        text: `⚠️ Erro ao criar tarefa: ${error.message}`,
        sender: 'system',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  /**
   * Converter ID de prioridade para label
   */
  const getPriorityLabel = (priorityId) => {
    const priorities = {
      1: 'alta',
      2: 'alta',
      3: 'média',
      4: 'baixa'
    };
    return priorities[priorityId] || 'média';
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[320px] h-[80vh] min-h-[420px] flex-col bg-page border border-surface shadow-2xl rounded-3xl overflow-hidden">
        <ChatHeaderUI onClose={onClose} />

        <div className="flex-1 overflow-y-auto bg-surface-2 px-6 py-4 space-y-4">
          {messages.map(msg => (
            <ChatBubbleUI 
              key={msg.id} 
              message={msg} 
              sender={msg.sender}
              functionResults={msg.functionResults}
              isError={msg.isError}
            />
          ))}

          {loading && <ChatLoadingUI />}

          <div ref={messagesEndRef} />
        </div>

        <ChatInputUI
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSendMessage}
          disabled={loading}
          inputRef={inputRef}
        />
      </div>
    </>
  );
}
