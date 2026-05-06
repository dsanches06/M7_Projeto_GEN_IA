import { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatTaskDisplayUI,
  ChatInputUI
} from '../ui';

/**
 * ChatUI - Modal flutuante do ChatBot AI
 * Integrado com Dashboard para atualizar tarefas em tempo real
 * 
 * Padrão: Segue arquitetura de componentes do frontend original
 */
export function ChatUI({ isOpen, onClose, onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! 👋 Sou o TaskBot AI. Descreve uma tarefa em linguagem natural e vou ajudar-te a organizá-la.\n\nExemplos:\n• 'Adiciona uma tarefa urgente para rever código amanhã'\n• 'Cria uma tarefa de alta prioridade para bug do login'\n• 'Muda a prioridade da última tarefa para média'",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastTask, setLastTask] = useState(null);
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

    // Adicionar mensagem do utilizador
    const userMsg = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Enviar para API/Gemini
      const response = await chatService.sendMessage(
        input,
        messages.map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text
        }))
      );

      // Adicionar resposta do bot
      const botMsg = {
        id: messages.length + 2,
        text: response.message || response.content || "Desculpa, não consegui processar isso.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      // Extrair dados de tarefa
      const taskData = chatService.extractTaskData(response.message || response.content);
      if (taskData) {
        setLastTask(taskData);

        // Notificar parent que uma tarefa foi criada
        if (onTaskCreated) {
          onTaskCreated(taskData);
        }

        // Adicionar mensagem de confirmação
        setTimeout(() => {
          const confirmMsg = {
            id: messages.length + 3,
            text: '✅ Tarefa adicionada ao dashboard! Clica no X para fechar e ver a nova tarefa.',
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMsg]);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = {
        id: messages.length + 2,
        text: `❌ Erro ao processar mensagem: ${error.message}`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Modal ChatUI */}
      <div className="fixed bottom-0 right-0 top-0 w-full md:w-96 bg-page border-l border-surface z-50 flex flex-col shadow-2xl">
        
        {/* Header */}
        <ChatHeaderUI onClose={onClose} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map(msg => (
            <ChatBubbleUI key={msg.id} message={msg} sender={msg.sender} />
          ))}

          {loading && <ChatLoadingUI />}

          <div ref={messagesEndRef} />
        </div>

        {/* Task Display */}
        <ChatTaskDisplayUI taskData={lastTask} />

        {/* Input Area */}
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
