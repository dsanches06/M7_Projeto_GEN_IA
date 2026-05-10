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

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  CREATED: "Criada", ASSIGNED: "Atribuída", IN_PROGRESS: "Em Progresso",
  BLOCKED: "Bloqueada", COMPLETED: "Concluída", ARCHIVED: "Arquivada",
};
const STATUS_COLORS = {
  CREATED:     { bg: "#FEFCE8", color: "#CA8A04" },
  ASSIGNED:    { bg: "#EFF6FF", color: "#2563EB" },
  IN_PROGRESS: { bg: "#F5F3FF", color: "#7C3AED" },
  BLOCKED:     { bg: "#FFF1F2", color: "#EF4444" },
  COMPLETED:   { bg: "#F0FDF4", color: "#16A34A" },
  ARCHIVED:    { bg: "#F9FAFB", color: "#6B7280" },
};

const groupConversationsByDate = (conversations) => {
  const sorted = [...conversations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const week      = new Date(today); week.setDate(week.getDate() - 7);
  const groups = { Hoje: [], Ontem: [], "Esta Semana": [], Anteriores: [] };
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

function TaskStatusPreview({ taskUpdated }) {
  const statusName = taskUpdated.status_name || "UNKNOWN";
  const cfg = STATUS_COLORS[statusName] || STATUS_COLORS.ARCHIVED;
  const label = STATUS_LABELS[statusName] || statusName;
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm" style={{ borderColor: cfg.color + "40" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span>🔄</span>
        <span className="text-xs font-bold" style={{ color: cfg.color }}>Estado atualizado</span>
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate mb-1.5">
        {taskUpdated.title || `Tarefa #${taskUpdated.id}`}
      </p>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-gray-400">ID #{taskUpdated.id} →</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {label}
        </span>
      </div>
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
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 pt-0.5">Tarefa</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {assignment.task_title || `Tarefa #${assignment.task_id}`}
            </p>
            <p className="text-[10px] text-gray-400">ID #{assignment.task_id}</p>
          </div>
        </div>
        <div className="border-t border-[#BFDBFE]" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 w-14 flex-shrink-0">Atribuído</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[#BFDBFE] flex items-center justify-center text-[9px] font-bold text-[#1D4ED8] flex-shrink-0">
              {initial}
            </div>
            <p className="text-xs font-semibold text-gray-800 truncate">
              {assignment.user_name || `Utilizador #${assignment.user_id}`}
            </p>
            <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">#{assignment.user_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TagAssignmentPreview({ tagAssignment }) {
  const { task_id, task_title, added = [], skipped = [] } = tagAssignment;
  const TAG_COLOR_HEX = {
    Red: "#EF4444", Green: "#22C55E", Blue: "#3B82F6",
    Orange: "#F97316", Purple: "#A855F7", Grey: "#6B7280",
  };
  return (
    <div className="rounded-xl border border-[#E9D5FF] bg-[#FAF5FF] p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <span>🏷️</span>
        <span className="text-xs font-bold text-[#7C3AED]">
          Etiqueta{added.length !== 1 ? "s" : ""} adicionada{added.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-start gap-2 mb-2">
        <span className="text-[10px] text-gray-400 w-12 flex-shrink-0 pt-0.5">Tarefa</span>
        <div>
          <p className="text-xs font-semibold text-gray-800 truncate">
            {task_title || `Tarefa #${task_id}`}
          </p>
          <p className="text-[10px] text-gray-400">ID #{task_id}</p>
        </div>
      </div>
      <div className="border-t border-[#E9D5FF] mb-2" />
      {added.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {added.map((tag) => {
            const hexColor = TAG_COLOR_HEX[tag.tag_color] || tag.tag_color || "#6B7280";
            return (
              <span
                key={tag.tag_id}
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: hexColor + "18", color: hexColor, border: `1px solid ${hexColor}40` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hexColor }} />
                {tag.tag_name}
              </span>
            );
          })}
        </div>
      )}
      {skipped.length > 0 && (
        <p className="text-[10px] text-gray-400 mt-1.5">
          Já existiam: {skipped.map((t) => t.tag_name).join(", ")}
        </p>
      )}
    </div>
  );
}

function TicketPreview({ ticket, onNavigate }) {
  const sev   = ticket.severity || 5;
  const color = sev >= 8 ? "#DC2626" : sev >= 5 ? "#D97706" : sev >= 3 ? "#2563EB" : "#16A34A";
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-gray-400">Ticket #{ticket.id}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
          Sev. {sev}/10
        </span>
      </div>
      <p className="text-xs text-gray-700 line-clamp-2 mb-2">{ticket.user_report}</p>
      <button
        onClick={onNavigate}
        className="w-full text-xs bg-[var(--primary)] text-white rounded-lg py-1.5 hover:bg-[var(--primary-hover)] transition-colors font-medium"
      >
        Ver página de Tickets →
      </button>
    </div>
  );
}

// ── Welcome message ───────────────────────────────────────────────────────────

const INITIAL_MESSAGE = {
  id: "welcome",
  text: "🤖 Olá! Sou o TaskBot AI!\n\nPosso criar tarefas, atribuí-las, mudar estados, adicionar etiquetas, notificações e tickets.\n\nExemplos:\n• 'Cria uma tarefa urgente para rever o login'\n• 'Move a tarefa 1 para em progresso'\n• 'Atribui a tarefa 5 ao Bruno'\n• 'Marca a tarefa 3 como concluída'",
  sender: "bot",
  timestamp: new Date(),
};

// ── ChatUI ────────────────────────────────────────────────────────────────────

export function ChatUI({ isOpen, onClose, onTaskCreated, onTaskUpdated, onTicketCreated }) {
  const [messages,            setMessages]            = useState([INITIAL_MESSAGE]);
  const [input,               setInput]               = useState("");
  const [loading,             setLoading]             = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversationId,      setConversationId]      = useState(null);
  const [conversations,       setConversations]       = useState([]);
  const [showHistory,         setShowHistory]         = useState(false);
  const [banner,              setBanner]              = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3000);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (!isOpen) return;
    chatService.getConversations()
      .then((all) => { if (all?.length) { setConversations(all); setShowHistory(true); } })
      .catch(() => {});
  }, [isOpen]);

  // ── History helpers ───────────────────────────────────────────────────────

  const handleSelectConversation = async (conv) => {
    setConversationId(conv.id);
    setShowHistory(false);
    try {
      const summary = await summaryService.getSummaryByConversationId(conv.id);
      const text = summary?.summary
        ? `📋 Resumo:\n\n${summary.summary}`
        : "⏳ Resumo ainda a ser gerado.";
      setMessages([{ id: `${conv.id}-s`, text, sender: "bot", timestamp: new Date() }]);
      setConversationHistory(
        summary?.summary ? [{ role: "assistant", content: summary.summary }] : []
      );
    } catch {
      setMessages([{
        id: `${conv.id}-e`,
        text: "Não foi possível carregar o resumo.",
        sender: "bot",
        timestamp: new Date(),
      }]);
      setConversationHistory([]);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setShowHistory(false);
    setMessages([{ ...INITIAL_MESSAGE, timestamp: new Date() }]);
    setConversationHistory([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFallback = async (fr) => {
    try {
      const d = chatService.extractTaskDataFromFunctionResult(fr);
      if (d && onTaskCreated) await onTaskCreated(d);
    } catch (e) {
      setBanner({ message: `Erro: ${e.message}`, type: "error" });
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const botMsgId    = Date.now() + 1;

    const botMsg = {
      id: botMsgId, text: "", sender: "bot", timestamp: new Date(),
      functionResults: [],
      taskData:        null,
      taskUpdatedData: null,
      assignmentData:  null,
      tagData:         null,
      ticketData:      null,
    };

    const updatedHistory = [...conversationHistory, { role: "user", content: userMessage }];
    setMessages((p) => [
      ...p,
      { id: Date.now(), text: userMessage, sender: "user", timestamp: new Date() },
      botMsg,
    ]);
    setConversationHistory(updatedHistory);
    setInput("");
    setLoading(true);

    try {
      await chatService.sendMessageToBotStream(
        userMessage,
        updatedHistory,

        // onChunk
        (chunk) => {
          setMessages((p) =>
            p.map((m) => m.id === botMsgId ? { ...m, text: `${m.text || ""}${chunk}` } : m)
          );
        },

        // onDone
        (done) => {
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

          const persisted =
            done?.task || done?.notification || done?.ticket ||
            done?.assignment || done?.tagAssignment || done?.taskUpdated;
          if (!persisted && done?.functionResults?.[0]) handleFallback(done.functionResults[0]);

          // ── Task created ────────────────────────────────────────────────
          if (done?.task) {
            if (onTaskCreated) onTaskCreated(done.task);
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, taskData: done.task } : m)
            );
          }

          // ── Task status updated ─────────────────────────────────────────
          if (done?.taskUpdated) {
            if (onTaskUpdated) onTaskUpdated(done.taskUpdated);
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, taskUpdatedData: done.taskUpdated } : m)
            );
          }

          // ── Assignment ──────────────────────────────────────────────────
          if (done?.assignment) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, assignmentData: done.assignment } : m)
            );
          }

          // ── Tag assignment ──────────────────────────────────────────────
          if (done?.tagAssignment) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, tagData: done.tagAssignment } : m)
            );
          }

          // ── Ticket ──────────────────────────────────────────────────────
          if (done?.ticket) {
            setMessages((p) =>
              p.map((m) => m.id === botMsgId ? { ...m, ticketData: done.ticket } : m)
            );
          }

          // ── Notification ────────────────────────────────────────────────
          if (done?.notification) {
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
    } catch (err) {
      setMessages((p) =>
        p.map((m) =>
          m.id === botMsgId ? { ...m, text: `❌ Erro: ${err.message}`, isError: true } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const grouped = groupConversationsByDate(conversations);

  return (
    <>
      {banner && <InfoBanner message={banner.message} type={banner.type} isVisible />}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden" onClick={onClose} />

      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[320px] h-[80vh] min-h-[420px] flex-col bg-page border border-surface shadow-2xl rounded-3xl overflow-hidden">
        <ChatHeaderUI onClose={onClose} />

        {/* ── History overlay ── */}
        {showHistory && (
          <div className="absolute inset-0 z-50 bg-page rounded-3xl flex flex-col">
            <div className="px-4 py-3 border-b border-surface flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-main">Histórico</h3>
                <p className="text-xs text-muted mt-0.5">
                  {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
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
                      className="w-full px-4 py-3 text-left hover:bg-surface-2 border-b border-surface transition-colors group"
                    >
                      <p className="text-sm font-medium text-main truncate group-hover:text-[var(--primary)]">
                        {conv.title}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{formatDate(conv.created_at)}</p>
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
                  <ChatBubbleUI message={msg} sender={msg.sender} isError={msg.isError} />

                  {/* Preview cards below the bubble */}
                  {(msg.taskData || msg.taskUpdatedData || msg.assignmentData ||
                    msg.tagData || msg.ticketData) && (
                    <div className="flex justify-start mt-2">
                      <div className="max-w-[260px] w-full space-y-2">

                        {msg.taskData && (
                          <TaskCreatedPreview task={msg.taskData} />
                        )}

                        {msg.taskUpdatedData && (
                          <TaskStatusPreview taskUpdated={msg.taskUpdatedData} />
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
                            onNavigate={() => { onClose(); if (onTicketCreated) onTicketCreated(); }}
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
