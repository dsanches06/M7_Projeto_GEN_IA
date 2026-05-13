import path from "path";
import { fileURLToPath } from "url";
import { Ollama } from "ollama";
import createSystemPrompt from "./createSystemPrompt.js";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ── Environment validation ────────────────────────────────────────────────────
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

if (!process.env.OLLAMA_MODEL) {
  console.error("OLLAMA_MODEL is not defined in environment variables.");
  process.exit(1);
}

const MODEL_NAME = process.env.OLLAMA_MODEL;

// ── Ollama instance ───────────────────────────────────────────────────────────
const ollama = new Ollama({
  host: OLLAMA_HOST,
});

// ── Ollama error classifier ───────────────────────────────────────────────────
function classifyOllamaError(error) {
  const msg = error?.message || "";

  if (
    msg.toLowerCase().includes("fetch failed") ||
    msg.toLowerCase().includes("econnrefused") ||
    msg.toLowerCase().includes("connect")
  ) {
    return {
      type: "SERVICE_DOWN",
      userMessage:
        "O serviço Ollama está temporariamente indisponível. Verifique se o Ollama está em execução. 🔧",
    };
  }

  if (
    msg.toLowerCase().includes("model") &&
    msg.toLowerCase().includes("not found")
  ) {
    return {
      type: "MODEL_NOT_FOUND",
      userMessage:
        "O modelo configurado não foi encontrado no Ollama. Execute: ollama pull llama3.2 📦",
    };
  }

  if (msg.toLowerCase().includes("timeout")) {
    return {
      type: "TIMEOUT",
      userMessage: "O modelo demorou demasiado tempo a responder. ⏳",
    };
  }

  if (msg.toLowerCase().includes("invalid")) {
    return {
      type: "INVALID_REQUEST",
      userMessage: "O pedido enviado para o Ollama é inválido. ✏️",
    };
  }

  return {
    type: "UNKNOWN",
    userMessage: "O assistente de IA não está disponível de momento. 🤖",
  };
}

// ── Shared config builder ─────────────────────────────────────────────────────
function buildOllamaConfig(tools = null, extraConfig = {}) {
  return {
    model: MODEL_NAME,
    options: {
      temperature: 0.25,
    },
    tools: tools
      ? tools.map((tool) => ({
          type: "function",
          function: tool,
        }))
      : undefined,

    ...extraConfig,
  };
}

// ── Ollama chat helpers ─────────────────────────────────────────────────────
function normalizeOllamaHistory(history = []) {
  return history.flatMap((item) => {
    const role = item.role === "model" ? "assistant" : item.role;
    const content = item.parts
      .map((part) => part.text || String(part))
      .join(" ")
      .trim();

    if (!content) return [];
    return [{ role, content }];
  });
}

function convertMessageToOllama(message) {
  if (typeof message === "string") {
    return { role: "user", content: message };
  }

  if (message?.role === "tool" && Array.isArray(message.parts)) {
    return message.parts
      .map((part) => {
        if (part.functionResponse) {
          const { name, response } = part.functionResponse;
          return {
            role: "tool",
            tool_name: name,
            content:
              typeof response === "string"
                ? response
                : JSON.stringify(response),
          };
        }

        if (part.text) {
          return {
            role: "tool",
            content: part.text,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  if (message?.role && Array.isArray(message.parts)) {
    const content = message.parts
      .map((part) => part.text || String(part))
      .join(" ")
      .trim();

    return {
      role: message.role === "model" ? "assistant" : message.role,
      content,
    };
  }

  if (message?.role && typeof message.content === "string") {
    return {
      role: message.role === "model" ? "assistant" : message.role,
      content: message.content,
    };
  }

  return null;
}

function normalizeOllamaResponse(response) {
  const message = response?.message || {};
  const text = message.content || "";
  const functionCalls = (message.tool_calls || []).map((toolCall) => ({
    name: toolCall.function?.name,
    args: toolCall.function?.arguments || {},
    functionCall: toolCall,
  }));

  return {
    text,
    functionCalls,
    raw: response,
  };
}

// ── createOllamaChat ──────────────────────────────────────────────────────────
// Cria uma sessão de chat stateful compatível com o loop de BaseChatProcessor
export const createOllamaChat = async (tools = null, history = []) => {
  const prompt = createSystemPrompt();
  const conversation = normalizeOllamaHistory(history);

  return {
    sendMessage: async ({ message }) => {
      const incoming = Array.isArray(message) ? message : [message];
      for (const item of incoming) {
        const converted = convertMessageToOllama(item);
        if (!converted) continue;

        if (Array.isArray(converted)) {
          conversation.push(...converted);
        } else {
          conversation.push(converted);
        }
      }

      try {
        const response = await ollama.chat({
          ...buildOllamaConfig(tools),
          messages: [
            {
              role: "system",
              content: prompt,
            },
            ...conversation,
          ],
        });

        return normalizeOllamaResponse(response);
      } catch (error) {
        const classified = classifyOllamaError(error);

        console.error(`[Ollama Chat] ${classified.type}:`, error.message);

        const enriched = new Error(classified.userMessage);
        enriched.ollamaType = classified.type;
        enriched.originalError = error;

        throw enriched;
      }
    },
  };
};

// ── generateAIContent (stateless) ─────────────────────────────────────────────
const generateAIContent = async (messages, options = {}) => {
  const {
    systemInstruction = createSystemPrompt(),
    temperature = 0.25,
    tools = null,
    stream = false,
    ...extraConfig
  } = options;

  try {
    return await ollama.chat({
      ...buildOllamaConfig(tools, {
        options: {
          temperature,
        },
        stream,
        ...extraConfig,
      }),

      messages: [
        {
          role: "system",
          content: systemInstruction,
        },
        ...messages,
      ],
    });
  } catch (error) {
    const classified = classifyOllamaError(error);

    console.error(`[Ollama] ${classified.type}:`, error.message);

    const enriched = new Error(classified.userMessage);
    enriched.ollamaType = classified.type;
    enriched.originalError = error;

    throw enriched;
  }
};

// ── generateAIContentStream ───────────────────────────────────────────────────
export const generateAIContentStream = async (messages, options = {}) => {
  return generateAIContent(messages, {
    ...options,
    stream: true,
  });
};
