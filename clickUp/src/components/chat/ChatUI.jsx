/**
 * @fileoverview Componente ChatUI - Interface principal do chat com TaskBot AI.
 * Responsável por gerenciar conversas, mensagens e previews de ações.
 */

import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatInputUI,
  GeminiErrorCard,
} from "@/components/chat/index.js";
import {
  groupConversationsByDate,
  formatConversationDate,
  createWelcomeMessage,
} from "@/utils/chatUtils";
import {
  TaskCreatedPreview,
  TaskUpdatedPreview,
  TaskDeletedPreview,
  AssignmentPreview,
  TagAssignmentPreview,
  TicketPreview,
} from "@/components/chat/previews";

// ── ChatUI ────────────────────────────────────────────────────────────────────
/**
 * Componente principal da interface de chat.
 * Gerencia mensagens, histórico de conversas e interações com o TaskBot AI.
 * @param {boolean} isOpen - Indica se o chat está aberto.
 * @param {Function} onClose - Função para fechar o chat.
 * @param {Function} onTaskCreated - Callback quando uma tarefa é criada.
 * @param {Function} onTaskUpdated - Callback quando uma tarefa é atualizada.
 * @param {Function} onTaskDeleted - Callback quando uma tarefa é eliminada.
 * @param {Function} onTicketCreated - Callback quando um ticket é criado.
 */
export function ChatUI({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTaskAssigned,
  onTicketCreated,
  onTicketUpdated,
  onNotificationCreated,
  onUserOrTagAction,
}) {
  const [messages, setMessages] = useState([createWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    chatService
      .getConversations()
      .then((all) => {
        if (all?.length) {
          setConversations(all);
          setShowHistory(true);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // ── Conversation history ──────────────────────────────────────────────────

  const handleSelectConversation = async (conv) => {
    setConversationId(conv.id);
    setShowHistory(false);
    try {
      const historyRows = await chatService.getChatHistory(conv.id);
      const rows = Array.isArray(historyRows) ? historyRows : [];

      // Build AI context history (role_id 2 = user, 3 = model)
      const history = rows.map((r) => ({
        role: r.role_id === 2 ? "user" : "assistant",
        content: r.content,
      }));
      setConversationHistory(history);

      const summaryResponse = await chatService.getChatSummary(conv.id);
      const summaryText =
        summaryResponse?.success && summaryResponse?.summary
          ? summaryResponse.summary
          : "Resumo não disponível para esta conversa.";

      setMessages([
        {
          id: `${conv.id}-summary`,
          text: summaryText,
          sender: "bot",
          timestamp: new Date(),
          isSummary: true,
        },
      ]);
    } catch {
      setMessages([
        {
          id: `${conv.id}-e`,
          text: "Não foi possível carregar o histórico.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setConversationHistory([]);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setShowHistory(false);
    setMessages([{ ...createWelcomeMessage(), timestamp: new Date() }]);
    setConversationHistory([]);
    setLastUserMessage(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Add inline error message to chat ─────────────────────────────────────
  const addErrorMessage = (errorType, message) => {
    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        text: "",
        sender: "bot",
        timestamp: new Date(),
        geminiError: { errorType, message },
      },
    ]);
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const doSend = async (userMessage) => {
    const botMsgId = Date.now() + 1;

    const botMsg = {
      id: botMsgId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      functionResults: [],
      taskData: null,
      taskUpdatedData: null,
      taskDeletedData: null,
      assignmentData: null,
      tagData: null,
      ticketData: null,
      geminiError: null,
    };

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    setMessages((p) => [
      ...p,
      {
        id: Date.now(),
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      },
      botMsg,
    ]);
    setConversationHistory(updatedHistory);
    setLoading(true);

    try {
      await chatService.sendMessageToBotStream(
        userMessage,
        updatedHistory,
        (chunk) => {
          setMessages((p) =>
            p.map((m) =>
              m.id === botMsgId ? { ...m, text: `${m.text || ""}${chunk}` } : m,
            ),
          );
        },
        (done) => {
          // ── Any error (Gemini, HTTP, server) → show inline ─────────────
          if (done?.success === false || done?.geminiError) {
            const errorMsg = done.message || "Erro desconhecido.";
            const errType = done.errorType || "UNKNOWN";
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? {
                      ...m,
                      text: "",
                      geminiError: { errorType: errType, message: errorMsg },
                    }
                  : m,
              ),
            );
            return;
          }

          // ── Success ───────────────────────────────────────────────────
          if (done?.conversationId) {
            setConversationId(done.conversationId);
            chatService
              .getConversations()
              .then(setConversations)
              .catch(() => {});
          }
          if (done?.message) {
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId ? { ...m, text: done.message } : m,
              ),
            );
            setConversationHistory((p) => [
              ...p,
              { role: "assistant", content: done.message },
            ]);
          }
          if (done?.functionResults?.length) {
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? { ...m, functionResults: done.functionResults }
                  : m,
              ),
            );
          }

          // ── Persist preview cards + callbacks ─────────────────────────
          if (done?.task) {
            if (onTaskCreated) onTaskCreated(done.task);
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId ? { ...m, taskData: done.task } : m,
              ),
            );
          }
          if (done?.taskUpdated) {
            if (onTaskUpdated) onTaskUpdated(done.taskUpdated);
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? { ...m, taskUpdatedData: done.taskUpdated }
                  : m,
              ),
            );
          }
          if (done?.taskDeleted) {
            if (onTaskDeleted) onTaskDeleted(done.taskDeleted.id);
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? { ...m, taskDeletedData: done.taskDeleted }
                  : m,
              ),
            );
          }
          if (done?.assignment) {
            if (onTaskAssigned && done.assignment?.task_id)
              onTaskAssigned({
                id: done.assignment.task_id,
                ...done.assignment,
              });
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? { ...m, assignmentData: done.assignment }
                  : m,
              ),
            );
          }
          if (done?.tags) {
            if (onTaskAssigned && done.tags?.task_id)
              onTaskAssigned({ id: done.tags.task_id, ...done.tags });
            if (onUserOrTagAction) onUserOrTagAction();
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId ? { ...m, tagData: done.tags } : m,
              ),
            );
          }
          if (done?.ticket) {
            if (
              done.ticket._type !== "ticket_deleted" &&
              done.ticket._type !== "ticket_status"
            ) {
              if (onTicketCreated) onTicketCreated(done.ticket);
            } else if (
              done.ticket._type === "ticket_deleted" ||
              done.ticket._type === "ticket_status"
            ) {
              if (onTicketUpdated) onTicketUpdated(done.ticket);
            }
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId ? { ...m, ticketData: done.ticket } : m,
              ),
            );
          }
          if (done?.notification) {
            if (onNotificationCreated) onNotificationCreated();
            setMessages((p) => [
              ...p,
              {
                id: Date.now() + 3,
                text: `✅ Notificação "${done.notification.title}" enviada!`,
                sender: "system",
                timestamp: new Date(),
              },
            ]);
          }
        },
        conversationId,
      );
    } catch {
      // Network-level failure (chatService already handles most via onDone)
      setMessages((p) =>
        p.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: "",
                geminiError: {
                  errorType: "NETWORK_ERROR",
                  message:
                    "Não foi possível ligar ao servidor. Verifique a sua ligação. 🌐",
                },
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setLastUserMessage(userMessage);
    setInput("");
    await doSend(userMessage);
  };

  const handleRetry = async () => {
    if (!lastUserMessage || loading) return;
    // Remove last bot message (which has error)
    setMessages((p) => {
      const lastBotIdx = [...p].reverse().findIndex((m) => m.sender === "bot");
      if (lastBotIdx === -1) return p;
      const idx = p.length - 1 - lastBotIdx;
      return p.filter((_, i) => i !== idx && i !== idx - 1);
    });
    await doSend(lastUserMessage);
  };

  if (!isOpen) return null;

  const grouped = groupConversationsByDate(conversations);

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      <div
        className={[
          "fixed z-50 flex flex-col bg-page border border-surface shadow-2xl overflow-hidden",
          "inset-x-0 top-[52px] bottom-[64px] rounded-none",
          "md:inset-auto md:bottom-6 md:right-6 md:w-[320px] md:h-[80vh] md:min-h-[420px] md:rounded-3xl",
        ].join(" ")}
      >
        <ChatHeaderUI onClose={onClose} />

        {/* ── History overlay ── */}
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-page flex flex-col md:rounded-3xl">
            <div className="px-4 py-3 border-b border-surface flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-main">Histórico</h3>
                <p className="text-xs text-muted mt-0.5">
                  {conversations.length} conversa
                  {conversations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleNewConversation}
                className="text-xs px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] font-medium"
              >
                + Nova
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {grouped.map(({ label, convs }) => (
                <div key={label}>
                  <div className="px-4 py-1.5 bg-surface sticky top-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {label}
                    </span>
                  </div>
                  {convs.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="w-full px-4 py-3 text-left hover:bg-surface-2 active:bg-surface-3 border-b border-surface transition-colors group cursor-pointer"
                      title="Clique para ver o resumo da conversa"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-main truncate flex-1 group-hover:text-[var(--primary)] transition-colors">
                          {conv.title}
                        </p>
                        <span className="text-lg flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          📋
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {formatConversationDate(conv.created_at)}
                      </p>
                    </button>
                  ))}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted text-sm">
                  Nenhuma conversa
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Chat view ── */}
        {!showHistory && (
          <>
            <div className="flex-1 overflow-y-auto bg-surface-2 px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {/* Normal text bubble */}
                  {msg.text && (
                    <ChatBubbleUI message={msg} sender={msg.sender} />
                  )}

                  {/* Inline error card — shown for ALL error types (Gemini + HTTP + server) */}
                  {msg.geminiError && (
                    <div className="flex justify-start mt-1">
                      <div className="max-w-[280px] w-full">
                        <GeminiErrorCard
                          errorType={msg.geminiError.errorType}
                          message={msg.geminiError.message}
                          onRetry={handleRetry}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action preview cards */}
                  {(msg.taskData ||
                    msg.taskUpdatedData ||
                    msg.taskDeletedData ||
                    msg.assignmentData ||
                    msg.tagData ||
                    msg.ticketData) && (
                    <div className="flex justify-start mt-2">
                      <div className="max-w-[280px] w-full space-y-2">
                        {msg.taskData && (
                          <TaskCreatedPreview task={msg.taskData} />
                        )}
                        {msg.taskUpdatedData && (
                          <TaskUpdatedPreview
                            taskUpdated={msg.taskUpdatedData}
                          />
                        )}
                        {msg.taskDeletedData && (
                          <TaskDeletedPreview
                            taskDeleted={msg.taskDeletedData}
                          />
                        )}
                        {msg.assignmentData && (
                          <AssignmentPreview assignment={msg.assignmentData} />
                        )}
                        {msg.tagData && (
                          <TagAssignmentPreview tagAssignment={msg.tagData} />
                        )}
                        {msg.ticketData && (
                          <TicketPreview
                            ticket={msg.ticketData}
                            onNavigate={() => {
                              if (onTicketCreated)
                                onTicketCreated(msg.ticketData);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && <ChatLoadingUI />}
              <div ref={messagesEndRef} />
            </div>

            <ChatInputUI
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSend}
              disabled={loading}
              inputRef={inputRef}
            />

            {conversations.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="py-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center"
              >
                📋 Ver histórico ({conversations.length})
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
