export function getBackendUrl() {
  if (import.meta.env.PROD) {
    return "/api";
  }

  const raw = import.meta.env.VITE_BACKEND_URL;
  if (raw) {
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(raw);
    if (!isLocal) return raw.endsWith("/api") ? raw : raw.replace(/\/?$/, "/api");
    return raw.endsWith("/api") ? raw : raw.replace(/\/?$/, "/api");
  }

  return "http://localhost:3001/api";
}

export const BACKEND_URL = getBackendUrl();

class BaseService {
  constructor(baseEndpoint) { this.BACKEND_URL = BACKEND_URL; this.baseEndpoint = baseEndpoint; }

  async sendStreamMessage(endpoint, payload, onChunk, onDone) {
    try {
      const response = await fetch(`${this.BACKEND_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
      const reader = response.body.getReader(), decoder = new TextDecoder();
      let buffer = "", event = null, data = "", donePayload = null;
      const flush = () => {
        if (!event) return;
        if (event === "message") { try { const p = JSON.parse(data); if (p?.text) onChunk(p.text); } catch {} }
        if (event === "done") { try { const p = JSON.parse(data); donePayload = p; if (onDone) onDone(p); } catch {} }
        if (event === "error") { try { const p = JSON.parse(data); throw new Error(p?.message || "Erro"); } catch(e) { throw e; } }
        event = null; data = "";
      };
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("event:")) event = line.replace("event:", "").trim();
          else if (line.startsWith("data:")) data += line.replace("data:", "").trim();
          else if (line.trim() === "") flush();
        }
      }
      if (buffer.trim()) { for (const line of buffer.split("\n")) { if (line.startsWith("event:")) event = line.replace("event:","").trim(); else if (line.startsWith("data:")) data += line.replace("data:","").trim(); else if (line.trim()==="") flush(); } flush(); }
      return donePayload ?? { success: true };
    } catch (err) { console.error(`[${this.baseEndpoint}] stream error:`, err); throw err; }
  }

  async sendMessage(endpoint, payload) {
    const res = await fetch(`${this.BACKEND_URL}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    return res.json();
  }

  async fetchData(endpoint) {
    const res = await fetch(`${this.BACKEND_URL}${endpoint}`);
    if (!res.ok) throw new Error(`Erro ao buscar dados: ${res.status} ${res.statusText}`);
    return res.json();
  }

  hasFunctionResults(r) { return r && r.success && Array.isArray(r.functionResults) && r.functionResults.length > 0; }
  getFirstFunctionResult(r) { return this.hasFunctionResults(r) ? r.functionResults[0] : null; }
  extractDataFromFunctionResult(fr) { return fr?.result ? { ...fr.result } : null; }
}

export default BaseService;
