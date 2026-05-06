import { useState, useRef, useEffect } from 'react';
import { chatService } from '@/services/chatService';
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatTaskDisplayUI,
  ChatInputUI
} from '@/components/chat';

const quickQuestions = [
  'What are your business hours?',
  'How can I track my order?',
  "What's your return policy?"
];

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
      const response = await chatService.sendMessage(
        input,
        messages.map(m => ({
          role: m.sender === 'bot' ? 'assistant' : 'user',
          content: m.text
        }))
      );

      const botMsg = {
        id: messages.length + 2,
        text: response.message || response.content || "Desculpa, não consegui processar isso.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

      const taskData = chatService.extractTaskData(response.message || response.content);
      if (taskData) {
        setLastTask(taskData);
        if (onTaskCreated) {
          onTaskCreated(taskData);
        }
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

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col bg-page border-l border-surface shadow-2xl rounded-tl-3xl rounded-bl-3xl overflow-hidden">
        <ChatHeaderUI onClose={onClose} />

        <div className="flex-1 overflow-y-auto bg-surface-2 px-6 py-4 space-y-4">
          {messages.map(msg => (
            <ChatBubbleUI key={msg.id} message={msg} sender={msg.sender} />
          ))}

          {loading && <ChatLoadingUI />}

          <div className="bg-surface-3 border border-surface rounded-3xl p-4">
            <p className="text-sm font-semibold text-main mb-3">Quick questions:</p>
            <div className="space-y-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left rounded-2xl border border-surface bg-page px-4 py-3 text-sm text-secondary hover:border-[var(--primary)] hover:bg-surface-3 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>

        <ChatTaskDisplayUI taskData={lastTask} />

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
