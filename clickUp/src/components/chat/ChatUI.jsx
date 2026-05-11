import { useState, useRef, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { summaryService } from "@/services/summaryService";
import {
  ChatBubbleUI,
  ChatHeaderUI,
  ChatLoadingUI,
  ChatInputUI,
} from "@/components/chat";
import { GeminiErrorCard } from "@/components/chat/GeminiErrorCard";

// ── Helpers ───────────────────────────────────────────────────────────────────

const groupConversationsByDate = (conversations) => {
  const sorted = [...conversations].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const week      = new Date(today); week.setDate(week.getDate() - 7);
  const groups    = { Hoje: [], Ontem: [], "Esta Semana": [], Anteriores: [] };
  sorted.forEach((conv) => {
    const d = new Date(conv.created_at);
    if      (d >= today)     groups["Hoje"].push(conv);
    else if (d >= yesterday) groups["Ontem"].push(conv);
    else if (d >= week)      groups["Esta Semana"].push(conv);
    else                     groups["Anteriores"].push(conv);
  });
  return Object.entries(groups)
    .filter(([, c]) => c.length > 0)
    .map(([label, convs]) => ({ label, convs }));
};

const formatDate = (s) => {
  try {
    return new Date(s).toLocaleString("pt-PT", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

// ── Preview cards ─────────────────────────────────────────────────────────────

function TaskCreatedPreview({ task }) {
  return (
    <div className="rounded-xl border border-[#D1FAE5] bg-[#F0FDF4] p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span>✅</span>
        <span className="text-xs font-bold text-[#065F46]">Tarefa criada</span>
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate">{task.title}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">ID #{task.id}</p>
    </div>
  );
}

function TaskUpdatedPreview({ taskUpdated }) {
  const STATUS_COLORS = {
    CREATED:"#EAB308", ASSIGNED:"#3B82F6", IN_PROGRESS:"#8B5CF6",
    BLOCKED:"#EF4444", COMPLETED:"#22C55E", ARCHIVED:"#9CA3AF",
  };
  const statusName = taskUpdated.status_name || "UPDATED";
  const color      = STATUS_COLORS[statusName] || "#6B7280";
  return (
    <div className="rounded-xl p-3 shadow-sm"
      style={{ border: `1px solid ${color}40`, background: `${color}12` }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span>🔄</span>
        <span className="text-xs font-bold" style={{ color }}>
          {statusName === "UPDATED" ? "Tarefa atualizada" : "Estado atualizado"}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate">
        {taskUpdated.title || `Tarefa #${taskUpdated.id}`}
      </p>
      {statusName !== "UPDATED" && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-bold" style={{ color }}>{statusName}</span>
          <span className="text-[10px] text-gray-400 ml-auto">ID #{taskUpdated.id}</span>
        </div>
      )}
    </div>
  );
}

function TaskDeletedPreview({ taskDeleted }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span>🗑️</span>
        <span className="text-xs font-bold text-red-700">Tarefa eliminada</span>
      </div>
      <p className="text-xs font-semibold text-gray-700 truncate">
        {taskDeleted.title || `Tarefa #${taskDeleted.id}`}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">ID #{taskDeleted.id}</p>
    </div>
  );
}

function AssignmentPreview({ assignment }) {
  const initial = (assignment.user_name || "?").charAt(0).toUpperCase();
  return (
    <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <span>🔗</span>
        <span className="text-xs font-bold text-[#1D4ED8]">Atribuição confirmada</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 pt-0.5">Tarefa</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">
            {assignment.task_title || `Tarefa #${assignment.task_id}`}
          </p>
          <p className="text-[10px] text-gray-400">ID #{assignment.task_id}</p>
        </div>
      </div>
      <div className="border-t border-[#BFDBFE] my-2" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-14 flex-shrink-0">Atribuído</span>
        <div className="w-5 h-5 rounded-full bg-[#BFDBFE] flex items-center justify-center text-[9px] font-bold text-[#1D4ED8] flex-shrink-0">
          {initial}
        </div>
        <p className="text-xs font-semibold text-gray-800 truncate flex-1">
          {assignment.user_name || `Utilizador #${assignment.user_id}`}
        </p>
        <span className="text-[10px] text-gray-400 flex-shrink-0">#{assignment.user_id}</span>
      </div>
    </div>
  );
}

function TagAssignmentPreview({ tagAssignment }) {
  const { task_id, task_title, added = [] } = tagAssignment;
  return (
    <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <span>🏷️</span>
        <span className="text-xs font-bold text-[#7C3AED]">
          Etiqueta{added.length !== 1 ? "s" : ""} adicionada{added.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-start gap-2 mb-2.5">
        <span className="text-[10px] text-gray-400 w-12 flex-shrink-0 pt-0.5">Tarefa</span>
        <div>
          <p className="text-xs font-semibold text-gray-800 truncate">
            {task_title || `Tarefa #${task_id}`}
          </p>
          <p className="text-[10px] text-gray-400">ID #{task_id}</p>
        </div>
      </div>
      {added.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {added.map((tag) => (
            <span key={tag.tag_id}
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${tag.tag_color}18`, color: tag.tag_color, border: `1px solid ${tag.tag_color}40` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.tag_color }} />
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketPreview({ ticket, onNavigate }) {
  if (ticket._type === "ticket_deleted")
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span>🗑️</span>
          <span className="text-xs font-bold text-red-700">Ticket #{ticket.id} eliminado</span>
        </div>
      </div>
    );

  if (ticket._type === "ticket_status")
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span>🔄</span>
          <span className="text-xs font-bold text-blue-700">
            Ticket #{ticket.id} → {ticket.status}
          </span>
        </div>
        <button onClick={onNavigate}
          className="mt-2 w-full text-xs bg-[var(--primary)] text-white rounded-lg py-1.5 hover:bg-[var(--primary-hover)]">
          Ver Tickets →
        </button>
      </div>
    );

  const sev   = ticket.severity || 5;
  const color = sev >= 8 ? "#DC2626" : sev >= 5 ? "#D97706" : sev >= 3 ? "#2563EB" : "#16A34A";
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm"
      style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-gray-400">Ticket #{ticket.id}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${color}18`, color }}>
          Sev. {sev}/10
        </span>
      </div>
      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{ticket.user_report}</p>
      <button onClick={onNavigate}
        className="w-full text-xs bg-[var(--primary)] text-white rounded-lg py-1.5 hover:bg-[var(--primary-hover)]">
        Ver página de Tickets →
      </button>
    </div>
  );
}

// ── Welcome message ───────────────────────────────────────────────────────────
const INITIAL_MESSAGE = {
  id:        "welcome",
  text:      "🤖 Olá! Sou o TaskBot AI!\n\nPosso criar, editar, eliminar e atribuir tarefas, tickets e notificações.\n\nExemplos:\n• 'Cria uma tarefa urgente para rever o login'\n• 'Atribui a tarefa 5 ao Bruno e adiciona etiqueta Urgente'\n• 'Move a tarefa 1 para em progresso'\n• 'Elimina o ticket 3'\n• 'Fecha o ticket 7'",
  sender:    "bot",
  timestamp: new Date(),
};

// ── ChatUI ────────────────────────────────────────────────────────────────────
export function ChatUI({
  isOpen,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTicketCreated,
}) {
  const [messages,            setMessages]            = useState([INITIAL_MESSAGE]);
  const [input,               setInput]               = useState("");
  const [loading,             setLoading]             = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId,      setConversationId]      = useState(null);
  const [conversations,       setConversations]       = useState([]);
  const [showHistory,         setShowHistory]         = useState(false);
  const [lastUserMessage,     setLastUserMessage]     = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    chatService.getConversations()
      .then((all) => { if (all?.length) { setConversations(all); setShowHistory(true); } })
      .catch(() => {});
  }, [isOpen]);

  // ── Conversation history ──────────────────────────────────────────────────

  const handleSelectConversation = async (conv) => {
    setConversationId(conv.id);
    setShowHistory(false);
    try {
      const summary = await summaryService.getSummaryByConversationId(conv.id);
      const text    = summary?.summary ? `📋 Resumo:\n\n${summary.summary}` : "⏳ Resumo ainda a ser gerado.";
      setMessages([{ id: `${conv.id}-s`, text, sender: "bot", timestamp: new Date() }]);
      setConversationHistory(summary?.summary ? [{ role: "assistant", content: summary.summary }] : []);
    } catch {
      setMessages([{ id: `${conv.id}-e`, text: "Não foi possível carregar o resumo.", sender: "bot", timestamp: new Date() }]);
      setConversationHistory([]);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setShowHistory(false);
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setConversationHistory([]);
    setLastUserMessage(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Add inline error message to chat ─────────────────────────────────────
  const addErrorMessage = (errorType, message) => {
    setMessages((p) => [
      ...p,
      {
        id:          Date.now(),
        text:        "",
        sender:      "bot",
        timestamp:   new Date(),
        geminiError: { errorType, message },
      },
    ]);
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const doSend = async (userMessage) => {
    const botMsgId = Date.now() + 1;

    const botMsg = {
      id:              botMsgId,
      text:            "",
      sender:          "bot",
      timestamp:       new Date(),
      functionResults: [],
      taskData:        null,
      taskUpdatedData: null,
      taskDeletedData: null,
      assignmentData:  null,
      tagData:         null,
      ticketData:      null,
      geminiError:     null,
    };

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    setMessages((p) => [
      ...p,
      { id: Date.now(), text: userMessage, sender: "user", timestamp: new Date() },
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
            p.map((m) => m.id === botMsgId ? { ...m, text: `${m.text || ""}${chunk}` } : m)
          );
        },
        (done) => {
          // ── Any error (Gemini, HTTP, server) → show inline ─────────────
          if (done?.success === false || done?.geminiError) {
            const errorMsg = done.message || "Erro desconhecido.";
            const errType  = done.errorType || "UNKNOWN";
            setMessages((p) =>
              p.map((m) =>
                m.id === botMsgId
                  ? { ...m, text: "", geminiError: { errorType: errType, message: errorMsg } }
                  : m
              )
            );
            return;
          }

          // ── Success ───────────────────────────────────────────────────
          if (done?.conversationId) {
            setConversationId(done.conversationId);
            chatService.getConversations().then(setConversations).catch(() => {});
          }
          if (done?.message) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, text: done.message } : m)
            );
            setConversationHistory((p) => [...p, { role: "assistant", content: done.message }]);
          }
          if (done?.functionResults?.length) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, functionResults: done.functionResults } : m)
            );
          }

          // ── Persist preview cards + callbacks ─────────────────────────
          if (done?.task) {
            if (onTaskCreated) onTaskCreated(done.task);
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, taskData: done.task } : m)
            );
          }
          if (done?.taskUpdated) {
            if (onTaskUpdated) onTaskUpdated(done.taskUpdated);
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, taskUpdatedData: done.taskUpdated } : m)
            );
          }
          if (done?.taskDeleted) {
            if (onTaskDeleted) onTaskDeleted(done.taskDeleted.id);
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, taskDeletedData: done.taskDeleted } : m)
            );
          }
          if (done?.assignment) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, assignmentData: done.assignment } : m)
            );
          }
          if (done?.tags) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, tagData: done.tags } : m)
            );
          }
          if (done?.ticket) {
            if (done.ticket._type !== "ticket_deleted" && done.ticket._type !== "ticket_status") {
              if (onTicketCreated) onTicketCreated();
            }
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, ticketData: done.ticket } : m)
            );
          }
          if (done?.notification) {
            setMessages((p) => [
              ...p,
              { id: Date.now() + 3, text: `✅ Notificação "${done.notification.title}" enviada!`, sender: "system", timestamp: new Date() },
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
            ? { ...m, text: "", geminiError: { errorType: "NETWORK_ERROR", message: "Não foi possível ligar ao servidor. Verifique a sua ligação. 🌐" } }
            : m
        )
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
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />

      <div className={[
        "fixed z-50 flex flex-col bg-page border border-surface shadow-2xl overflow-hidden",
        "inset-x-0 top-[52px] bottom-[64px] rounded-none",
        "md:inset-auto md:bottom-6 md:right-6 md:w-[320px] md:h-[80vh] md:min-h-[420px] md:rounded-3xl",
      ].join(" ")}>
        <ChatHeaderUI onClose={onClose} />

        {/* ── History overlay ── */}
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-page flex flex-col md:rounded-3xl">
            <div className="px-4 py-3 border-b border-surface flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-main">Histórico</h3>
                <p className="text-xs text-muted mt-0.5">{conversations.length} conversa{conversations.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={handleNewConversation}
                className="text-xs px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] font-medium">
                + Nova
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {grouped.map(({ label, convs }) => (
                <div key={label}>
                  <div className="px-4 py-1.5 bg-surface sticky top-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</span>
                  </div>
                  {convs.map((conv) => (
                    <button key={conv.id} onClick={() => handleSelectConversation(conv)}
                      className="w-full px-4 py-3 text-left hover:bg-surface-2 border-b border-surface transition-colors group">
                      <p className="text-sm font-medium text-main truncate group-hover:text-[var(--primary)]">{conv.title}</p>
                      <p className="text-xs text-muted mt-0.5">{formatDate(conv.created_at)}</p>
                    </button>
                  ))}
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted text-sm">Nenhuma conversa</div>
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
                  {(msg.taskData || msg.taskUpdatedData || msg.taskDeletedData ||
                    msg.assignmentData || msg.tagData || msg.ticketData) && (
                    <div className="flex justify-start mt-2">
                      <div className="max-w-[280px] w-full space-y-2">
                        {msg.taskData        && <TaskCreatedPreview  task={msg.taskData} />}
                        {msg.taskUpdatedData && <TaskUpdatedPreview  taskUpdated={msg.taskUpdatedData} />}
                        {msg.taskDeletedData && <TaskDeletedPreview  taskDeleted={msg.taskDeletedData} />}
                        {msg.assignmentData  && <AssignmentPreview   assignment={msg.assignmentData} />}
                        {msg.tagData         && <TagAssignmentPreview tagAssignment={msg.tagData} />}
                        {msg.ticketData      && (
                          <TicketPreview
                            ticket={msg.ticketData}
                            onNavigate={() => { if (onTicketCreated) onTicketCreated(); }}
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
              <button onClick={() => setShowHistory(true)}
                className="py-2 text-xs text-muted hover:text-main transition-colors border-t border-surface text-center">
                📋 Ver histórico ({conversations.length})
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
