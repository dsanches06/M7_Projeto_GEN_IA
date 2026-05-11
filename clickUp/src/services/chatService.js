import BaseService from "../services/BaseService.js";
import { Task } from "../models/Task.js";

class ChatService extends BaseService {
  constructor() {
    super("/chat");
  }

  // ── Stream com tratamento de gemini_error ────────────────────────────────
  async sendMessageToBotStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone,
    conversationId = null,
  ) {
    const payload = { message, conversationHistory, conversationId };

    try {
      const response = await fetch(`${this.BACKEND_URL}/chat/message/stream`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!response.ok) {
        // Erro HTTP antes do stream (ex: 400, 500)
        let errorMsg;
        try {
          const body = await response.json();
          errorMsg = body?.error || body?.message || `Erro HTTP ${response.status}`;
        } catch {
          errorMsg = `Erro HTTP ${response.status}`;
        }
        throw Object.assign(new Error(errorMsg), {
          geminiType:  "UNKNOWN",
          isGeminiErr: false,
        });
      }

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
            // Repassa ao caller como done com flag de erro
            if (onDone)
              onDone({
                ...parsed,
                success:     false,
                geminiError: true,
              });

          } else if (event === "error") {
            // Erro genérico do servidor
            if (onDone)
              onDone({
                success:     false,
                geminiError: false,
                errorType:   "UNKNOWN",
                message:     parsed?.message || "Erro inesperado do servidor.",
              });
          }
        } catch {
          /* chunk inválido — ignora */
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

      // Flush do buffer restante
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) {
          if      (line.startsWith("event:")) event  = line.replace("event:", "").trim();
          else if (line.startsWith("data:"))  data  += line.replace("data:",  "").trim();
          else if (line.trim() === "")        flush();
        }
        flush();
      }
    } catch (err) {
      // Erro de rede / fetch failed
      const isGemini = !!err?.geminiType;
      const msg = isGemini
        ? err.message
        : "Não foi possível ligar ao servidor. Verifique a sua ligação. 🌐";

      if (onDone)
        onDone({
          success:     false,
          geminiError: isGemini,
          errorType:   err?.geminiType || "NETWORK_ERROR",
          message:     msg,
        });
      else
        throw err;
    }
  }

  async sendMessageToConversation(conversationId, message) {
    return this.sendMessage(`/chat/conversation/${conversationId}/message`, { message });
  }

  async sendMessage(endpoint, payload, onChunk, onDone, conversationId = null) {
    if (onChunk || onDone)
      return this.sendMessageToBotStream(payload, [], onChunk, onDone, conversationId);
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
