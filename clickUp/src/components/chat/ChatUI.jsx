import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { summaryService } from "@/services/summaryService";
import { InfoBanner } from "@/components/ui/InfoBanner";
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatInputUI,
} from "@/components/chat";

// ── Agrupa conversas por data (mais recentes primeiro) ──────────────────────
const groupConversationsByDate = (conversations) => {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups = { Hoje: [], Ontem: [], "Esta Semana": [], Anteriores: [] };

  sorted.forEach((conv) => {
    const d = new Date(conv.created_at);
    if (d >= startOfToday) groups["Hoje"].push(conv);
    else if (d >= startOfYesterday) groups["Ontem"].push(conv);
    else if (d >= startOfWeek) groups["Esta Semana"].push(conv);
    else groups["Anteriores"].push(conv);
  });

  return Object.entries(groups)
    .filter(([, convs]) => convs.length > 0)
    .map(([label, convs]) => ({ label, convs }));
};

// ── Formato de data legível ─────────────────────────────────────────────────
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("pt-PT", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const INITIAL_MESSAGE = {
  id: "welcome",
  text:
    "🤖 Olá! Sou o TaskBot AI com IA Generativa!\n\nDescreva uma tarefa em linguagem natural e vou criar automaticamente para você.\n\nExemplos:\n• 'Crie uma tarefa urgente para implementar login na próxima semana'\n• 'Tarefa de alta prioridade: corrigir bug do formulário'\n• 'Implementar autenticação com prioridade máxima'",
  sender: "bot",
  timestamp: new Date(),
};

/**
 * ChatUI — Modal flutuante do TaskBot AI
 *
 * Fluxo de conversas:
 *  1. Envio de mensagem → IA responde em stream → resumo gerado em background
 *  2. Lista de conversas ordenada por data desc, agrupada por período
 *  3. Ao seleccionar conversa → carrega resumo da tabela summaries
 */
export function ChatUI({ isOpen, onClose, onTaskCreated }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversationsList, setShowConversationsList] = useState(false);
  const [banner, setBanner] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Scroll automático ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus no input ao abrir ──────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // ── Limpa o banner após 3 s ──────────────────────────────────────────────
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(t);
  }, [banner]);

  // ── Carrega conversas quando o chat abre ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const all = await chatService.getConversations();
        if (all && all.length > 0) {
          setConversations(all);
          setShowConversationsList(true);
        }
      } catch (err) {
        console.error("Erro ao carregar conversas:", err);
      }
    })();
  }, [isOpen]);

  // ── Seleccionar conversa — carrega APENAS o resumo ───────────────────────
  const handleSelectConversation = async (selectedConv) => {
    setConversationId(selectedConv.id);
    setShowConversationsList(false);

    try {
      const summary = await summaryService.getSummaryByConversationId(selectedConv.id);

      if (summary && summary.summary) {
        setMessages([
          {
            id: `${selectedConv.id}-summary`,
            text: `📋 Resumo da conversa anterior:\n\n${summary.summary}`,
            sender: "bot",
            timestamp: new Date(summary.created_at || Date.now()),
          },
        ]);
        // O resumo serve de contexto para a IA continuar a conversa
        setConversationHistory([
          { role: "assistant", content: summary.summary },
        ]);
      } else {
        // Resumo ainda não gerado (conversa muito recente)
        setMessages([
          {
            id: `${selectedConv.id}-pending`,
            text: "⏳ O resumo desta conversa ainda está a ser gerado. Pode continuar a conversa normalmente.",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setConversationHistory([]);
      }
    } catch (err) {
      console.error("Erro ao carregar resumo:", err);
      setMessages([
        {
          id: `${selectedConv.id}-error`,
          text: "Não foi possível carregar o resumo. Pode continuar a conversa normalmente.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setConversationHistory([]);
    }
  };

  // ── Iniciar nova conversa ─────────────────────────────────────────────────
  const handleNewConversation = () => {
    setConversationId(null);
    setShowConversationsList(false);
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setConversationHistory([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Enviar mensagem ───────────────────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const botMsgId = Date.now() + 1;

    const userMsg = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };
    const botMsg = {
      id: botMsgId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      functionResults: [],
    };

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setConversationHistory(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      await chatService.sendMessageToBotStream(
        userMessage,
        updatedHistory,
        // onChunk
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, text: `${m.text || ""}${chunk}` } : m
            )
          );
        },
        // onDone
        (donePayload) => {
          if (donePayload?.conversationId) {
            setConversationId(donePayload.conversationId);
            // Actualiza lista de conversas para incluir a nova
            chatService.getConversations().then(setConversations).catch(() => {});
          }

          if (donePayload?.message) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId ? { ...m, text: donePayload.message } : m
              )
            );
            setConversationHistory((prev) => [
              ...prev,
              { role: "assistant", content: donePayload.message },
            ]);
          }

          if (donePayload?.functionResults?.length) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId
                  ? { ...m, functionResults: donePayload.functionResults }
                  : m
              )
            );
            handleCreateTaskFromFunction(donePayload.functionResults[0]);
          }

          if (donePayload?.task && onTaskCreated) {
            onTaskCreated(donePayload.task);
          }
        },
        conversationId
      );
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? { ...m, text: `❌ Erro: ${err.message}`, isError: true }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Criar tarefa a partir do function result ──────────────────────────────
  const handleCreateTaskFromFunction = async (functionResult) => {
    try {
      const taskData = chatService.extractTaskDataFromFunctionResult(functionResult);
      if (!taskData) throw new Error("Não foi possível extrair dados da tarefa");
      if (onTaskCreated) await onTaskCreated(taskData);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: `✅ Tarefa "${taskData.title}" criada com sucesso!`,
          sender: "system",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error creating task:", err);
      setBanner({ message: `Erro ao criar tarefa: ${err.message}`, type: "error" });
    }
  };

  if (!isOpen) return null;

  const groupedConversations = groupConversationsByDate(conversations);

  return (
    <>
      {banner && <InfoBanner message={banner.message} type={banner.type} />}

      {/* Overlay mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[320px] h-[80vh] min-h-[420px] flex-col bg-page border border-surface shadow-2xl rounded-3xl overflow-hidden">
        <ChatHeaderUI onClose={onClose} />

        {/* ── Lista de Conversas ── */}
        {showConversationsList && (
          <div className="absolute inset-0 z-50 bg-page rounded-3xl flex flex-col">
            {/* Cabeçalho da lista */}
            <div className="px-4 py-3 border-b border-surface flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-main">
                  Histórico de Conversas
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {conversations.length} conversa
                  {conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleNewConversation}
                className="text-xs px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] transition-colors font-medium"
              >
                + Nova
              </button>
            </div>

            {/* Conversas agrupadas por data, ordenadas desc */}
            <div className="flex-1 overflow-y-auto">
              {groupedConversations.map(({ label, convs }) => (
                <div key={label}>
                  {/* Header do grupo */}
                  <div className="px-4 py-1.5 bg-surface sticky top-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {label}
                    </span>
                  </div>

                  {/* Conversas do grupo */}
                  {convs.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full px-4 py-3 text-left hover:bg-surface-2 border-b border-surface transition-colors group"
                    >
                      <p className="text-sm font-medium text-main truncate group-hover:text-[var(--primary)] transition-colors">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDate(conv.created_at)}
                      </p>
                    </button>
                  ))}
                </div>
              ))}

              {conversations.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted text-sm">
                  Nenhuma conversa anterior
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Chat normal ── */}
        {!showConversationsList && (
          <>
            <div className="flex-1 overflow-y-auto bg-surface-2 px-4 py-4 space-y-4">
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

            {/* Barra inferior — acesso ao histórico */}
            {conversations.length > 0 && (
              <button
                onClick={() => setShowConversationsList(true)}
                className="py-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center"
              >
                📋 Ver histórico de conversas ({conversations.length})
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
