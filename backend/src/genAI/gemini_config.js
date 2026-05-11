import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import createSystemPrompt from "./createSystemPrompt.js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables.");
  process.exit(1);
}

if (!process.env.MODEL_NAME) {
  console.error("MODEL_NAME is not defined in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = process.env.MODEL_NAME || "gemini-2.5-flash-lite";

// ── Classificador de erros da API Gemini ─────────────────────────────────────
function classifyGeminiError(error) {
  const msg  = error?.message || "";
  const code = error?.status  || error?.code || 0;

  // 503 / Service Unavailable
  if (
    code === 503 ||
    msg.includes("503") ||
    msg.toLowerCase().includes("service unavailable") ||
    msg.toLowerCase().includes("overloaded") ||
    msg.toLowerCase().includes("unavailable")
  ) {
    return {
      type: "SERVICE_DOWN",
      userMessage:
        "O serviço de IA está temporariamente indisponível. Tente novamente em alguns instantes. 🔧",
    };
  }

  // 429 / Rate limit
  if (
    code === 429 ||
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate limit") ||
    msg.toLowerCase().includes("resource_exhausted")
  ) {
    return {
      type: "RATE_LIMIT",
      userMessage:
        "Limite de pedidos atingido. Aguarde alguns segundos e tente novamente. ⏳",
    };
  }

  // 401 / 403 — chave inválida
  if (
    code === 401 ||
    code === 403 ||
    msg.includes("401") ||
    msg.includes("403") ||
    msg.toLowerCase().includes("api key") ||
    msg.toLowerCase().includes("permission denied") ||
    msg.toLowerCase().includes("unauthorized")
  ) {
    return {
      type: "AUTH_ERROR",
      userMessage:
        "Erro de autenticação com o serviço de IA. Contacte o administrador. 🔑",
    };
  }

  // Timeout / rede
  if (
    msg.toLowerCase().includes("timeout") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("enotfound") ||
    msg.toLowerCase().includes("network") ||
    msg.toLowerCase().includes("fetch failed")
  ) {
    return {
      type: "NETWORK_ERROR",
      userMessage:
        "Não foi possível ligar ao serviço de IA. Verifique a sua ligação à internet. 🌐",
    };
  }

  // 400 — pedido inválido
  if (code === 400 || msg.includes("400") || msg.toLowerCase().includes("invalid")) {
    return {
      type: "INVALID_REQUEST",
      userMessage: "O pedido não pôde ser processado. Tente reformular a mensagem. ✏️",
    };
  }

  // Erro genérico
  return {
    type: "UNKNOWN",
    userMessage: "O assistente de IA não está disponível de momento. Tente novamente. 🤖",
  };
}

// ── Helper interno ────────────────────────────────────────────────────────────
function buildGeminiConfig(tools, extraConfig = {}) {
  return {
    systemInstruction: createSystemPrompt(),
    temperature: 0.25,
    tools: tools ? [{ functionDeclarations: tools }] : undefined,
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.ANY },
    },
    ...extraConfig,
  };
}

// ── generateAIContent ─────────────────────────────────────────────────────────
const generateAIContent = async (contents, options = {}) => {
  const {
    systemInstruction = createSystemPrompt(),
    temperature = 0.25,
    tools = null,
    ...extraConfig
  } = options;

  try {
    return await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: buildGeminiConfig(tools, {
        systemInstruction,
        temperature,
        ...extraConfig,
      }),
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error(`[Gemini] ${classified.type}:`, error.message);

    // Anexa a mensagem amigável ao erro para o processador capturar
    const enriched = new Error(classified.userMessage);
    enriched.geminiType    = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

// ── generateAIContentStream ───────────────────────────────────────────────────
export const generateAIContentStream = async (contents, options = {}) => {
  const {
    systemInstruction = createSystemPrompt(),
    temperature = 0.25,
    tools = null,
    ...extraConfig
  } = options;

  try {
    return await genAI.models.generateContentStream({
      model: MODEL_NAME,
      contents,
      config: buildGeminiConfig(tools, {
        systemInstruction,
        temperature,
        ...extraConfig,
      }),
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error(`[Gemini Stream] ${classified.type}:`, error.message);

    const enriched = new Error(classified.userMessage);
    enriched.geminiType    = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

export default generateAIContent;
