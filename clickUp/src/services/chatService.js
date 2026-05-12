import BaseService from "../services/BaseService.js";
import { Task } from "../models/Task.js";

// ── Map HTTP status → error type ─────────────────────────────────────────────
function httpStatusToErrorType(status) {
  if (status === 400) return "VALIDATION_ERROR";
  if (status === 401 || status === 403) return "AUTH_ERROR";
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMIT";
  if (status === 503) return "SERVICE_DOWN";
  return "SERVER_ERROR";
}

class ChatService extends BaseService {
  constructor() {
    super("/chat");
  }

  // ── Stream com tratamento completo de erros ──────────────────────────────
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
    user_id = 1,
  ) {
    const payload = { message, conversationHistory, conversationId, user_id };

    try {
      const response = await fetch(`${this.BACKEND_URL}/chat/message/stream`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      // ── HTTP error BEFORE the stream starts ──────────────────────────────
      if (!response.ok) {
        let serverMessage;
        let errorType = httpStatusToErrorType(response.status);

        try {
          const body = await response.json();
          // Pick up the error message from the controller's JSON response
          serverMessage =
            body?.error ||
            body?.message ||
            body?.detail ||
            `Erro ${response.status}: ${response.statusText}`;
        } catch {
          serverMessage = `Erro ${response.status}: ${response.statusText}`;
        }

        if (onDone)
          onDone({
            success:     false,
            geminiError: false,
            errorType,
            message:     serverMessage,
          });
        return;
      }

      // ── Read SSE stream ───────────────────────────────────────────────────
      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", event = null, data = "";

      const flush = () => {
        if (!event) return;

        try {
          const parsed = JSON.parse(data);

          if (event === "message") {
            if (parsed?.text) onChunk(parsed.text);

          } else if (event === "done") {
            if (onDone) onDone(parsed);

          } else if (event === "gemini_error") {
            if (onDone)
              onDone({
                ...parsed,
                success:     false,
                geminiError: true,
              });

          } else if (event === "error") {
            // Generic server-side error event
            if (onDone)
              onDone({
                success:     false,
                geminiError: false,
                errorType:   parsed?.errorType || "SERVER_ERROR",
                message:     parsed?.message || "Erro inesperado do servidor.",
              });
          }
        } catch {
          /* malformed chunk — ignore */
        }

        event = null;
        data  = "";
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if      (line.startsWith("event:")) event  = line.replace("event:", "").trim();
          else if (line.startsWith("data:"))  data  += line.replace("data:",  "").trim();
          else if (line.trim() === "")        flush();
        }
      }

      // Flush any remaining buffer
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) {
          if      (line.startsWith("event:")) event  = line.replace("event:", "").trim();
          else if (line.startsWith("data:"))  data  += line.replace("data:",  "").trim();
          else if (line.trim() === "")        flush();
        }
        flush();
      }

    } catch (err) {
      // Network / fetch failure (no response at all)
      const isTimeout =
        err?.name === "AbortError" ||
        (err?.message || "").toLowerCase().includes("timeout");

      if (onDone)
        onDone({
          success:     false,
          geminiError: false,
          errorType:   isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
          message:
            isTimeout
              ? "O pedido demorou demasiado tempo. Tente novamente. ⏱️"
              : "Não foi possível ligar ao servidor. Verifique a sua ligação à internet. 🌐",
        });
      else
        throw err;
    }
  }

  async sendMessageToConversation(conversationId, message) {
    return this.sendMessage(
      `/chat/conversation/${conversationId}/message`,
      { message },
    );
  }

  async sendMessage(endpoint, payload, onChunk, onDone, conversationId = null) {
    if (onChunk || onDone)
      return this.sendMessageToBotStream(
        payload, [], onChunk, onDone, conversationId,
      );
    return super.sendMessage(endpoint, payload);
  }

  extractTaskDataFromFunctionResult(functionResult) {
    if (!functionResult?.result) return null;
    return Task.fromObject(functionResult.result)?.toPayload() || null;
  }

  extractTaskData(geminiResponse) {
    if (!geminiResponse) return null;
    if (typeof geminiResponse === "object")
      return Task.fromObject(geminiResponse)?.toPayload() || null;
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch)
        return Task.fromObject(JSON.parse(jsonMatch[0]))?.toPayload() || null;
    } catch { /* ignore */ }
    return null;
  }

  async getConversations()              { return this.fetchData("/conversations"); }
  async getChatSummary(conversationId)  { return this.fetchData(`/summaries/conversation/${conversationId}`); }
  async getChatHistory(conversationId)  { return this.fetchData(`/chat/history/conversation/${conversationId}`); }
}

export const chatService = new ChatService();
