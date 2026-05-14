import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import createSystemPrompt from "./createSystemPrompt.js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  process.env.GROQ_MODEL_NAME ||
  process.env.GROQ_MODEL_DEFAULT ||
  "gpt-4.1-mini";

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is not defined in environment variables.");
  process.exit(1);
}

if (!process.env.GROQ_MODEL) {
  console.warn(
    `GROQ_MODEL is not defined in environment variables. Using fallback model: ${GROQ_MODEL}`,
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ── Groq error classifier ───────────────────────────────────────────────────
function classifyGroqError(error) {
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
function buildGroqConfig(tools, extraConfig = {}) {
  return {
    messages: [{ role: "system", content: createSystemPrompt() }],
    temperature: 0.25,
    tools: tools ? tools : undefined,
    ...extraConfig,
  };
}

// ── createGroqChat ─────────────────────────────────────────────────────────
// Creates a stateful chat session (used by BaseChatProcessor agentic loop).
export const createGroqChat = (tools, history = []) => {
  try {
    // For Groq, we need to maintain conversation history manually
    const conversationHistory = [
      { role: "system", content: createSystemPrompt() },
      ...history,
    ];

    return {
      sendMessage: async (message) => {
        const messages = [
          ...conversationHistory,
          { role: "user", content: message },
        ];

        const response = await groq.chat.completions.create({
          model: GROQ_MODEL, // Default Groq model
          messages,
          temperature: 0.25,
          tools: tools ? tools : undefined,
        });

        const assistantMessage = response.choices[0]?.message;
        conversationHistory.push({ role: "user", content: message });
        if (assistantMessage) {
          conversationHistory.push(assistantMessage);
        }

        return response;
      },
      getHistory: () => conversationHistory,
    };
  } catch (error) {
    const classified = classifyGroqError(error);
    console.error(`[Groq Chat] ${classified.type}:`, error.message);
    const enriched = new Error(classified.userMessage);
    enriched.groqType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

// ── generateAIContent (stateless) ───────────────────────────────────────────
const generateAIContent = async (contents, options = {}) => {
  const { temperature = 0.25, tools = null, ...extraConfig } = options;

  try {
    const messages = [
      { role: "system", content: createSystemPrompt() },
      ...contents.map((content) => ({ role: "user", content })),
    ];

    return await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature,
      tools: tools ? tools : undefined,
      ...extraConfig,
    });
  } catch (error) {
    const classified = classifyGroqError(error);
    console.error(`[Groq] ${classified.type}:`, error.message);
    const enriched = new Error(classified.userMessage);
    enriched.groqType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

// ── generateAIContentStream (stateless) ─────────────────────────────────────
export const generateAIContentStream = async (contents, options = {}) => {
  const { temperature = 0.25, tools = null, ...extraConfig } = options;

  try {
    const messages = [
      { role: "system", content: createSystemPrompt() },
      ...contents.map((content) => ({ role: "user", content })),
    ];

    return await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature,
      tools: tools ? tools : undefined,
      stream: true,
      ...extraConfig,
    });
  } catch (error) {
    const classified = classifyGroqError(error);
    console.error(`[Groq Stream] ${classified.type}:`, error.message);
    const enriched = new Error(classified.userMessage);
    enriched.groqType = classified.type;
    enriched.originalError = error;
    throw enriched;
  }
};

export default generateAIContent;
