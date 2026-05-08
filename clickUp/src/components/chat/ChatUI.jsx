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
  const [conversations, setConversations] = useState([]);
  const [showConversationsList, setShowConversationsList] = useState(false);
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

  // Formata a data com validação
  const formatConversationDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Data inválida";
      }
      return date.toLocaleString("pt-PT", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Carrega todas as conversas quando o chat abre
  useEffect(() => {
    if (!isOpen) return;

    const loadConversations = async () => {
      try {
        const allConversations = await chatService.getConversations();
        if (allConversations && allConversations.length > 0) {
          setConversations(allConversations);
          setShowConversationsList(true);
        }
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      }
    };

    loadConversations();
  }, [isOpen]);

  // Carrega o resumo quando uma conversa é selecionada
  const handleSelectConversation = async (selectedConversation) => {
    try {
      setConversationId(selectedConversation.id);
      setShowConversationsList(false);

      let summary = null;
      try {
        summary = await chatService.getChatSummary(selectedConversation.id);
      } catch (summaryError) {
        console.warn("Resumo não disponível, buscando histórico em vez disso:", summaryError);
      }

      if (summary && summary.summary) {
        setMessages([
          {
            id: `${selectedConversation.id}-summary`,
            text: summary.summary,
            sender: "bot",
            timestamp: new Date(summary.created_at || Date.now()),
          },
        ]);
        setConversationHistory([
          { role: "assistant", content: summary.summary },
        ]);
        return;
      }

      const history = await chatService.getChatHistory(selectedConversation.id);
      if (history && history.length > 0) {
        // Transforma o histórico em formato de mensagens
        const loadedMessages = history.map((msg, idx) => ({
          id: idx,
          text: msg.content,
          sender: msg.role_id === 2 ? "user" : "bot", // 2 = user, 3 = assistant
          timestamp: new Date(msg.created_at),
        }));

        setMessages(loadedMessages);

        // Reconstrói o histórico de conversa para a IA
        const reconstructedHistory = history.map((msg) => ({
          role: msg.role_id === 2 ? "user" : "assistant",
          content: msg.content,
        }));
        setConversationHistory(reconstructedHistory);
      } else {
        setMessages([
          {
            id: `${selectedConversation.id}-empty`,
            text: "Resumo da conversa não encontrado. Inicie uma nova mensagem para continuar.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setConversationHistory([]);
      }
    } catch (error) {
      console.error("Erro ao carregar resumo da conversa:", error);
      setBanner({
        message: "Erro ao carregar conversa",
        type: "error",
      });
    }
  };

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

        {/* Lista de Conversas */}
        {showConversationsList && conversations.length > 0 && (
          <div className="absolute inset-0 z-50 bg-page rounded-3xl flex flex-col">
            <div className="p-4 border-b border-surface">
              <h3 className="text-lg font-bold text-main">Histórico de Conversas</h3>
              <p className="text-sm text-muted mt-1">Selecione uma conversa para continuar</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-2 border-b border-surface transition-colors text-sm"
                >
                  <p className="font-medium text-main truncate">{conv.title}</p>
                  <p className="text-xs text-muted mt-1">
                    {formatConversationDate(conv.created_at)}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-surface">
              <button
                onClick={() => {
                  setShowConversationsList(false);
                  setConversationId(null);
                  setMessages([
                    {
                      id: 1,
                      text: "🤖 Olá! Sou o TaskBot AI com IA Generativa!\n\nDescreva uma tarefa em linguagem natural e vou criar automaticamente para você.\n\nExemplos:\n• 'Crie uma tarefa urgente para implementar login na próxima semana'\n• 'Tarefa de alta prioridade: corrigir bug do formulário'\n• 'Implementar autenticação com prioridade máxima'",
                      sender: "bot",
                      timestamp: new Date(),
                    },
                  ]);
                  setConversationHistory([]);
                }}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                + Nova Conversa
              </button>
            </div>
          </div>
        )}

        {/* Chat Normal */}
        {!showConversationsList && (
          <>
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

            {/* Botão para voltar ao histórico */}
            {conversations.length > 0 && !conversationId && (
              <button
                onClick={() => setShowConversationsList(true)}
                className="p-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center"
              >
                📋 Ver histórico de conversas
              </button>
            )}

            {/* Botão para carregar histórico se tem conversa ativa */}
            {conversations.length > 0 && conversationId && (
              <button
                onClick={() => setShowConversationsList(true)}
                className="p-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center"
              >
                📋 Mudar conversa
              </button>
            )}

            {/* Botão para iniciar nova conversa quando ainda não há histórico */}
            {conversations.length === 0 && (
              <button
                onClick={() => {
                  setConversationId(null);
                  setShowConversationsList(false);
                  setMessages([
                    {
                      id: 1,
                      text: "🤖 Olá! Sou o TaskBot AI com IA Generativa!\n\nDescreva uma tarefa em linguagem natural e vou criar automaticamente para você.\n\nExemplos:\n• 'Crie uma tarefa urgente para implementar login na próxima semana'\n• 'Tarefa de alta prioridade: corrigir bug do formulário'\n• 'Implementar autenticação com prioridade máxima'",
                      sender: "bot",
                      timestamp: new Date(),
                    },
                  ]);
                  setConversationHistory([]);
                }}
                className="p-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center"
              >
                ➕ Iniciar nova conversa
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
