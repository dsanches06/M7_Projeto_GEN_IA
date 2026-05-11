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

// ── Gemini error classifier ───────────────────────────────────────────────────
function classifyGeminiError(error) {
  const msg = error?.message || "";
  const code = error?.status || error?.code || 0;

  if (
    code === 503 ||
    msg.includes("503") ||
    msg.toLowerCase().includes("service unavailable") ||
    msg.toLowerCase().includes("overloaded")
  )
    return {
      type: "SERVICE_DOWN",
      userMessage:
        "O serviço de IA está temporariamente indisponível. Tente novamente em alguns instantes. 🔧",
    };
  if (
    code === 429 ||
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("rate limit")
  )
    return {
      type: "RATE_LIMIT",
      userMessage:
        "Limite de pedidos atingido. Aguarde alguns segundos e tente novamente. ⏳",
    };
  if (
    code === 401 ||
    code === 403 ||
    msg.toLowerCase().includes("api key") ||
    msg.toLowerCase().includes("permission denied")
  )
    return {
      type: "AUTH_ERROR",
      userMessage:
        "Erro de autenticação com o serviço de IA. Contacte o administrador. 🔑",
    };
  if (
    msg.toLowerCase().includes("timeout") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("fetch failed")
  )
    return {
      type: "NETWORK_ERROR",
      userMessage:
        "Não foi possível ligar ao serviço de IA. Verifique a sua ligação à internet. 🌐",
    };
  if (
    code === 400 ||
    msg.includes("400") ||
    msg.toLowerCase().includes("invalid")
  )
    return {
      type: "INVALID_REQUEST",
      userMessage:
        "O pedido não pôde ser processado. Tente reformular a mensagem. ✏️",
    };
  return {
    type: "UNKNOWN",
    userMessage:
      "O assistente de IA não está disponível de momento. Tente novamente. 🤖",
  };
}

// ── Shared config builder ─────────────────────────────────────────────────────
function buildGeminiConfig(tools, extraConfig = {}) {
  return {
    systemInstruction: createSystemPrompt(),
    temperature: 0.25,
    tools: tools ? [{ functionDeclarations: tools }] : undefined,
    toolConfig: {
      functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
    },
    ...extraConfig,
  };
}

// ── createGeminiChat ─────────────────────────────────────────────────────────
// Creates a stateful chat session (used by BaseChatProcessor agentic loop).
// Matches the pattern in multifunction.js: ai.chats.create({ model, history, config })
export const createGeminiChat = (tools, history = []) => {
  try {
    return genAI.chats.create({
      model: MODEL_NAME,
      history,
      config: buildGeminiConfig(tools),
    });
  } catch (error) {
    const classified = classifyGeminiError(error);
    console.error(`[Gemini Chat] ${classified.type}:`, error.message);
    const enriched = new Error(classified.userMessage);
    enriched.geminiType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

// ── generateAIContent (stateless, kept for summaries processor) ───────────────
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
    const enriched = new Error(classified.userMessage);
    enriched.geminiType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

// ── generateAIContentStream (stateless, kept for summaries processor) ─────────
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
    enriched.geminiType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

export default generateAIContent;
