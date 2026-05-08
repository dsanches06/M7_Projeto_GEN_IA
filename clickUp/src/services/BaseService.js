/**
 * BaseService - Classe base para todos os serviços
 * Fornece métodos genéricos para streaming e comunicação com API
 * Evita duplicação de código entre chatService, ticketService e notificationService
 */

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
const BACKEND_URL = (() => {
  if (import.meta.env.DEV) {
    return rawBackendUrl || "http://localhost:3001";
  }

  if (rawBackendUrl) {
    const hasLocalhostInUrl =
      rawBackendUrl.startsWith("http://localhost") ||
      rawBackendUrl.startsWith("https://localhost") ||
      rawBackendUrl.startsWith("http://127.0.0.1") ||
      rawBackendUrl.startsWith("https://127.0.0.1");
    if (hasLocalhostInUrl) {
      return "/api";
    }
    return rawBackendUrl;
  }

  return "/api";
})();

class BaseService {
  constructor(baseEndpoint) {
    this.BACKEND_URL = BACKEND_URL;
    this.baseEndpoint = baseEndpoint; // ex: "/chat", "/tickets", "/notifications"
  }

  /**
   * Método genérico para streaming de dados
   * Implementa a lógica SSE (Server-Sent Events) reutilizável
   */
  async sendStreamMessage(endpoint, payload, onChunk, onDone) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let event = null;
      let data = "";
      let donePayload = null;

      const flushEvent = () => {
        if (!event) return;

        if (event === "message") {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData?.text) {
              onChunk(parsedData.text);
            }
          } catch (e) {
            console.warn("Failed to parse stream message payload", e);
          }
        }

        if (event === "done") {
          try {
            const parsedData = JSON.parse(data);
            donePayload = parsedData;
            if (onDone) onDone(parsedData);
          } catch (e) {
            console.warn("Failed to parse stream done payload", e);
          }
        }

        if (event === "error") {
          try {
            const parsedData = JSON.parse(data);
            throw new Error(parsedData?.message || "Erro no stream");
          } catch (e) {
            throw e;
          }
        }

        event = null;
        data = "";
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            data += line.replace("data:", "").trim();
          } else if (line.trim() === "") {
            flushEvent();
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.replace("event:", "").trim();
          } else if (line.startsWith("data:")) {
            data += line.replace("data:", "").trim();
          } else if (line.trim() === "") {
            flushEvent();
          }
        }
        flushEvent();
      }

      return donePayload ?? { success: true };
    } catch (error) {
      console.error(`${this.baseEndpoint} service error:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para envio de dados (sem stream)
   */
  async sendMessage(endpoint, payload) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`${this.baseEndpoint} service error:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para fetch GET
   */
  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`${this.baseEndpoint} service error:`, error);
      throw error;
    }
  }

  /**
   * Verifica se response possui function results
   */
  hasFunctionResults(response) {
    return (
      response &&
      response.success &&
      Array.isArray(response.functionResults) &&
      response.functionResults.length > 0
    );
  }

  /**
   * Obtém o primeiro function result
   */
  getFirstFunctionResult(response) {
    if (this.hasFunctionResults(response)) {
      return response.functionResults[0];
    }
    return null;
  }

  /**
   * Extrai dados de um function result
   */
  extractDataFromFunctionResult(functionResult, fieldMapping = {}) {
    if (!functionResult || !functionResult.result) {
      return null;
    }

    const data = functionResult.result;
    // fieldMapping permite mapear campos específicos de cada tipo
    return fieldMapping ? { ...data } : data;
  }
}

export default BaseService;
