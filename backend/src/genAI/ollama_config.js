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
function normalizeToolParameters(parameters = {}) {
  if (typeof parameters !== "object" || parameters === null) return parameters;

  const normalized = { ...parameters };

  if (typeof normalized.type === "string") {
    normalized.type = normalized.type.toLowerCase();
  }

  if (Array.isArray(normalized.required)) {
    normalized.required = normalized.required.map(String);
  }

  if (normalized.properties && typeof normalized.properties === "object") {
    normalized.properties = Object.fromEntries(
      Object.entries(normalized.properties).map(([key, value]) => [
        key,
        normalizeToolParameters(value),
      ]),
    );
  }

  if (normalized.items) {
    normalized.items = normalizeToolParameters(normalized.items);
  }

  return normalized;
}

function normalizeToolDeclaration(tool) {
  return {
    ...tool,
    parameters: normalizeToolParameters(tool.parameters),
  };
}

function buildOllamaConfig(tools = null, extraConfig = {}) {
  const normalizedTools = Array.isArray(tools)
    ? tools.map((tool) => ({
        type: "function",
        function: normalizeToolDeclaration(tool),
      }))
    : undefined;

  return {
    model: MODEL_NAME,
    options: {
      temperature: 0.25,
    },
    tools: normalizedTools?.length ? normalizedTools : undefined,
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

      const timerLabel = `Ollama Response Time ${Date.now()}`;
      const requestBody = {
        ...buildOllamaConfig(tools),
        messages: [
          {
            role: "system",
            content: prompt,
          },
          ...conversation,
        ],
      };
      const triedWithTools = Array.isArray(tools) && tools.length > 0;

      try {
        console.log(`[Ollama] 📤 Enviando mensagem para ${MODEL_NAME} (tools=${triedWithTools})...`);
        console.time(timerLabel);

        const response = await ollama.chat(requestBody);

        console.timeEnd(timerLabel);
        console.log(`[Ollama] ✅ Resposta recebida com sucesso`);

        return normalizeOllamaResponse(response);
      } catch (error) {
        console.timeEnd(timerLabel);
        const classified = classifyOllamaError(error);

        if (triedWithTools) {
          console.warn(
            `[Ollama] Falha com tools, a tentar novamente sem tools: ${error.message}`,
          );
          try {
            const retryBody = {
              ...buildOllamaConfig(null),
              messages: requestBody.messages,
            };
            console.time(`${timerLabel}-retry`);
            const retryResponse = await ollama.chat(retryBody);
            console.timeEnd(`${timerLabel}-retry`);
            console.log(`[Ollama] ✅ Resposta recebida sem tools`);
            return normalizeOllamaResponse(retryResponse);
          } catch (retryError) {
            const retryClassified = classifyOllamaError(retryError);
            console.error(
              `[Ollama Chat] Retry ${retryClassified.type}:`,
              retryError.message,
            );
            const enrichedRetry = new Error(retryClassified.userMessage);
            enrichedRetry.ollamaType = retryClassified.type;
            enrichedRetry.originalError = retryError;
            throw enrichedRetry;
          }
        }

        console.error(`[Ollama Chat] ${classified.type}:`, error.message);

        const enriched = new Error(classified.userMessage);
        enriched.ollamaType = classified.type;
        enriched.originalError = error;

        throw enriched;
      }
    },

    sendMessageStream: async ({ message }, onChunk) => {
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

      const timerLabel = `Ollama Stream Time ${Date.now()}`;
      const requestBody = {
        ...buildOllamaConfig(tools, { stream: true }),
        messages: [
          {
            role: "system",
            content: prompt,
          },
          ...conversation,
        ],
      };
      const triedWithTools = Array.isArray(tools) && tools.length > 0;
      let previousText = "";
      let lastResponse = null;

      try {
        console.log(`[Ollama] 📤 Enviando mensagem em stream para ${MODEL_NAME} (tools=${triedWithTools})...`);
        console.time(timerLabel);

        const streamResponse = await ollama.chat(requestBody);
        for await (const part of streamResponse) {
          if (!part) continue;
          lastResponse = part;
          const normalized = normalizeOllamaResponse(part);
          const text = normalized.text || "";
          const delta = text.startsWith(previousText)
            ? text.slice(previousText.length)
            : text;
          previousText = text;

          if (delta && typeof onChunk === "function") {
            onChunk(delta);
          }
        }

        console.timeEnd(timerLabel);
        console.log(`[Ollama] ✅ Stream finalizado`);

        if (!lastResponse) {
          throw new Error("Ollama stream não retornou resposta válida.");
        }

        return normalizeOllamaResponse(lastResponse);
      } catch (error) {
        console.timeEnd(timerLabel);
        const classified = classifyOllamaError(error);

        if (triedWithTools) {
          console.warn(
            `[Ollama] Falha em stream com tools, a tentar novamente sem tools: ${error.message}`,
          );
          try {
            const retryBody = {
              ...buildOllamaConfig(null, { stream: true }),
              messages: requestBody.messages,
            };
            console.time(`${timerLabel}-retry`);
            const retryResponse = await ollama.chat(retryBody);
            console.timeEnd(`${timerLabel}-retry`);
            console.log(`[Ollama] ✅ Stream finalizado sem tools`);

            let retryLastResponse = null;
            previousText = "";
            for await (const part of retryResponse) {
              if (!part) continue;
              retryLastResponse = part;
              const normalized = normalizeOllamaResponse(part);
              const text = normalized.text || "";
              const delta = text.startsWith(previousText)
                ? text.slice(previousText.length)
                : text;
              previousText = text;

              if (delta && typeof onChunk === "function") {
                onChunk(delta);
              }
            }

            if (!retryLastResponse) {
              throw new Error("Ollama stream não retornou resposta válida no retry.");
            }

            return normalizeOllamaResponse(retryLastResponse);
          } catch (retryError) {
            const retryClassified = classifyOllamaError(retryError);
            console.error(
              `[Ollama Chat] Retry ${retryClassified.type}:`,
              retryError.message,
            );
            const enrichedRetry = new Error(retryClassified.userMessage);
            enrichedRetry.ollamaType = retryClassified.type;
            enrichedRetry.originalError = retryError;
            throw enrichedRetry;
          }
        }

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

  const requestBody = {
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
  };
  const triedWithTools = Array.isArray(tools) && tools.length > 0;

  try {
    return await ollama.chat(requestBody);
  } catch (error) {
    const classified = classifyOllamaError(error);

    if (triedWithTools) {
      console.warn(
        `[Ollama] Falha com tools, a tentar novamente sem tools: ${error.message}`,
      );
      try {
        const retryBody = {
          ...buildOllamaConfig(null, {
            options: {
              temperature,
            },
            stream,
            ...extraConfig,
          }),
          messages: requestBody.messages,
        };
        return await ollama.chat(retryBody);
      } catch (retryError) {
        const retryClassified = classifyOllamaError(retryError);
        console.error(`[Ollama] Retry ${retryClassified.type}:`, retryError.message);
        const enrichedRetry = new Error(retryClassified.userMessage);
        enrichedRetry.ollamaType = retryClassified.type;
        enrichedRetry.originalError = retryError;
        throw enrichedRetry;
      }
    }

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
