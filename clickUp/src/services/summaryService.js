import BaseService from "./BaseService.js";

/**
 * SummaryService — Serviço de Resumos de Conversa
 * Herda de BaseService para reutilizar lógica de comunicação com o backend.
 *
 * Endpoints consumidos:
 *   GET  /summaries
 *   GET  /summaries/:id
 *   GET  /summaries/conversation/:conversationId
 *   POST /summaries
 *   PUT  /summaries/:id
 *   DELETE /summaries/:id
 *   POST /summaries/message/stream  (geração via IA)
 */
class SummaryService extends BaseService {
  constructor() {
    super("/summaries");
  }

  // ── Leitura ────────────────────────────────────────────────────────────

  /** Devolve todos os resumos */
  async getAllSummaries() {
    return this.fetchData("/summaries");
  }

  /** Devolve um resumo pelo ID */
  async getSummaryById(id) {
    return this.fetchData(`/summaries/${id}`);
  }

  /**
   * Devolve o resumo associado a uma conversa.
   * Usado pelo ChatUI ao seleccionar uma conversa do histórico.
   */
  async getSummaryByConversationId(conversationId) {
    try {
      return await this.fetchData(`/summaries/conversation/${conversationId}`);
    } catch {
      // Resumo ainda não gerado — devolve null sem lançar
      return null;
    }
  }

  // ── Escrita ────────────────────────────────────────────────────────────

  /** Cria um novo resumo */
  async createSummary(data) {
    return this.sendMessage("/summaries", data);
  }

  /** Actualiza um resumo existente */
  async updateSummary(id, data) {
    const res = await fetch(`${this.BACKEND_URL}/summaries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erro ao actualizar resumo: ${res.status}`);
    return res.json();
  }

  /** Remove um resumo */
  async deleteSummary(id) {
    const res = await fetch(`${this.BACKEND_URL}/summaries/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Erro ao apagar resumo: ${res.status}`);
    return res.json();
  }

  // ── Geração via IA (stream) ────────────────────────────────────────────

  /**
   * Envia uma mensagem para gerar um resumo com streaming.
   * O backend usa o chat_processor_summary para chamar set_create_summary_values.
   *
   * @param {string}   message             - Texto pedindo o resumo
   * @param {Array}    conversationHistory - Histórico de contexto
   * @param {Function} onChunk             - Callback para cada chunk de texto
   * @param {Function} onDone              - Callback com payload final
   */
  async generateSummaryStream(
    message,
    conversationHistory = [],
    onChunk,
    onDone
  ) {
    return this.sendStreamMessage(
      "/summaries/message/stream",
      { message, conversationHistory },
      onChunk,
      onDone
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Extrai os dados de resumo do resultado de uma function call.
   * Compatível com o formato devolvido por set_create_summary_values.
   */
  extractSummaryDataFromFunctionResult(functionResult) {
    if (!functionResult?.result) return null;
    const { conversation_id, original_text, summary } = functionResult.result;
    return { conversation_id, original_text, summary };
  }
}

// Singleton exportado
export const summaryService = new SummaryService();
