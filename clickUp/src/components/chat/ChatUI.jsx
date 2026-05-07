import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { InfoBanner } from "@/components/ui/InfoBanner";
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatTaskDisplayUI,
  ChatInputUI,
} from "@/components/chat";

/**
 * ChatUI - Modal flutuante do ChatBot AI com GenAI Function Calls
 * Integrado com Dashboard para atualizar tarefas em tempo real
 *
 * Padrão: Segue arquitetura de componentes do frontend original
 * Usa: chatService para executar function calls automaticamente
 */
export function ChatUI({ isOpen, onClose, onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "🤖 Olá! Sou o TaskBot AI com IA Generativa!\n\nDescreva uma tarefa em linguagem natural e vou criar automaticamente para você.\n\nExemplos:\n• 'Crie uma tarefa urgente para implementar login na próxima semana'\n• 'Tarefa de alta prioridade: corrigir bug do formulário'\n• 'Implementar autenticação com prioridade máxima'",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [banner, setBanner] = useState(null);
  const [streamingBotMessageId, setStreamingBotMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus no input quando abre
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Limpa o banner automaticamente após 3 segundos
  useEffect(() => {
    if (!banner) return;

    const timeout = window.setTimeout(() => {
      setBanner(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [banner]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const userMsg = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    const botMsgId = Date.now() + 1;
    const botMsg = {
      id: botMsgId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      functionResults: [],
    };

    const updatedConversationHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setConversationHistory(updatedConversationHistory);
    setStreamingBotMessageId(botMsgId);
    setInput("");
    setLoading(true);

    try {
      await chatService.sendMessageToBotStream(
        userMessage,
        updatedConversationHistory,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? { ...msg, text: `${msg.text || ""}${chunk}` }
                : msg
            )
          );
        },
        (donePayload) => {
          setStreamingBotMessageId(null);

          if (donePayload?.conversationId) {
            setConversationId(donePayload.conversationId);
          }

          if (donePayload?.message) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsgId
                  ? { ...msg, text: donePayload.message }
                  : msg
              )
            );
            setConversationHistory((prev) => [
              ...prev,
              { role: "assistant", content: donePayload.message },
            ]);
          }

          if (donePayload?.functionResults?.length) {
            const functionResult = donePayload.functionResults[0];
            handleCreateTaskFromFunction(functionResult);
          }

          if (donePayload?.task && onTaskCreated) {
            onTaskCreated(donePayload.task);
          }
        },
        conversationId,
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                text: `❌ Erro: ${error.message}`,
                isError: true,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setStreamingBotMessageId(null);
    }
  };

  /**
   * Criar tarefa a partir do resultado da função
   */
  const handleCreateTaskFromFunction = async (functionResult) => {
    try {
      const taskData =
        chatService.extractTaskDataFromFunctionResult(functionResult);

      if (!taskData) {
        throw new Error("Não foi possível extrair dados da tarefa");
      }

      // Callback para criar tarefa no Dashboard / backend
      if (onTaskCreated) {
        await onTaskCreated(taskData);
      }

      // Adicionar mensagem de sucesso
      const successMsg = {
        id: Date.now() + 2,
        text: `✅ Tarefa "${taskData.title}" criada com sucesso!`,
        sender: "system",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (error) {
      console.error("Error creating task:", error);
      setBanner({
        message: `Erro ao criar tarefa: ${error.message}`,
        type: "error",
      });
      const errorMsg = {
        id: Date.now() + 2,
        text: `⚠️ Erro ao criar tarefa: ${error.message}`,
        sender: "system",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {banner && <InfoBanner message={banner.message} type={banner.type} />}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[320px] h-[80vh] min-h-[420px] flex-col bg-page border border-surface shadow-2xl rounded-3xl overflow-hidden">
        <ChatHeaderUI onClose={onClose} />

        <div className="flex-1 overflow-y-auto bg-surface-2 px-6 py-4 space-y-4">
          {messages.map((msg) => (
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
