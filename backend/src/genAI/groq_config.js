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
  "openai/gpt-oss-20b";

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

// ── Shared tool normalization for Groq ─────────────────────────────────────
function normalizeGroqTools(tools) {
  if (!Array.isArray(tools)) return undefined;

  return tools.map((tool) => {
    if (tool.type === "function" && tool.function) {
      return tool;
    }

    if (tool.name && tool.parameters) {
      return {
        type: tool.type || "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      };
    }

    return {
      type: tool.type || "function",
      ...tool,
    };
  });
}

// ── Shared config builder ─────────────────────────────────────────────────────
function buildGroqConfig(tools, extraConfig = {}) {
  return {
    messages: [{ role: "system", content: createSystemPrompt() }],
    temperature: 0.25,
    tools: normalizeGroqTools(tools),
    ...extraConfig,
  };
}

const normalizeGroqText = (message) => {
  if (!message) return "";
  const { content } = message;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part == null) return "";
        if (typeof part === "string") return part;
        if (typeof part === "object") return part.text ?? JSON.stringify(part);
        return String(part);
      })
      .join("");
  }
  if (typeof content === "object" && content !== null) {
    return content.text || JSON.stringify(content);
  }

  // Fallback for Groq tool-only responses
  return String(message.text || message.reasoning || "");
};

const parseGroqFunctionArgs = (rawArgs) => {
  if (rawArgs == null) return null;
  if (typeof rawArgs === "object") return rawArgs;
  if (typeof rawArgs === "string") {
    try {
      return JSON.parse(rawArgs);
    } catch {
      return rawArgs;
    }
  }
  return rawArgs;
};

const extractGroqFunctionCalls = (response) => {
  if (!response || typeof response !== "object") return [];

  const candidates = [];
  const choice = response?.choices?.[0] || {};
  const message = choice.message || {};

  if (message.tool) candidates.push(message.tool);
  if (message.function_call) candidates.push(message.function_call);
  if (message.tool_call) candidates.push(message.tool_call);
  if (message.functionCall) candidates.push(message.functionCall);
  if (Array.isArray(message.tools)) candidates.push(...message.tools);
  if (Array.isArray(message.tool_calls)) candidates.push(...message.tool_calls);

  if (Array.isArray(choice.tool_calls)) candidates.push(...choice.tool_calls);
  if (Array.isArray(response.tool_calls)) candidates.push(...response.tool_calls);

  return candidates
    .filter((tool) => tool && typeof tool === "object")
    .map((tool) => {
      const functionSource = tool.function || tool;
      return {
        name: functionSource.name,
        args: parseGroqFunctionArgs(
          functionSource.arguments ?? functionSource.args,
        ),
        raw: tool,
      };
    })
    .filter((tool) => tool.name);
};

const normalizeGroqResponse = (response) => {
  const choice = response?.choices?.[0] || {};
  const assistantMessage = choice.message || {};

  return {
    ...response,
    text: normalizeGroqText(assistantMessage),
    functionCalls: extractGroqFunctionCalls(assistantMessage),
  };
};

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
        let normalizedMessage;

        const normalizeParts = (parts) => {
          if (!Array.isArray(parts)) return String(parts);
          return parts
            .map((part) => {
              if (part == null) return "";
              if (typeof part === "string") return part;
              if (typeof part === "object") return part.text ?? JSON.stringify(part);
              return String(part);
            })
            .join("");
        };

        if (typeof message === "string") {
          normalizedMessage = { role: "user", content: message };
        } else if (
          message &&
          typeof message === "object" &&
          message.role &&
          (typeof message.content === "string" || Array.isArray(message.content))
        ) {
          normalizedMessage = message;
        } else if (
          message &&
          typeof message === "object" &&
          Array.isArray(message.parts)
        ) {
          normalizedMessage = {
            role: message.role || "user",
            content: normalizeParts(message.parts),
          };
        } else if (
          message &&
          typeof message === "object" &&
          typeof message.message === "string"
        ) {
          normalizedMessage = { role: "user", content: message.message };
        } else {
          normalizedMessage = { role: "user", content: String(message) };
        }

        const messages = [
          ...conversationHistory,
          normalizedMessage,
        ];

        const response = await groq.chat.completions.create({
          model: GROQ_MODEL, // Default Groq model
          messages,
          temperature: 0.25,
          tools: normalizeGroqTools(tools),
        });

        const normalized = normalizeGroqResponse(response);
        conversationHistory.push(normalizedMessage);
        if (normalized?.choices?.[0]?.message) {
          conversationHistory.push(normalized.choices[0].message);
        }

        return normalized;
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

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature,
      tools: normalizeGroqTools(tools),
      ...extraConfig,
    });

    return normalizeGroqResponse(response);
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

    const response = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature,
      tools: normalizeGroqTools(tools),
      stream: true,
      ...extraConfig,
    });

    return normalizeGroqResponse(response);
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
