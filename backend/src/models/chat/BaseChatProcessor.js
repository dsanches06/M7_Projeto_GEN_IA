import generateAIContent, {
  generateAIContentStream,
} from "../../genAI/gemini_config.js";

export class BaseChatProcessor {
  constructor({ toolConfig = [], functionHandlers = {} }) {
    this.toolConfig       = toolConfig;
    this.functionHandlers = functionHandlers;
  }

  // ── Utilitários ─────────────────────────────────────────────────────────────

  getTextFromResponse(response) {
    if (!response?.candidates?.length) return "";

    const candidate = response.candidates[0];

    if (typeof candidate.text === "string") return candidate.text.trim();

    const content = candidate.content;

    if (Array.isArray(content)) {
      return content
        .flatMap((item) => {
          if (typeof item.text === "string") return [item.text];
          if (Array.isArray(item.parts))
            return item.parts
              .filter((p) => typeof p?.text === "string")
              .map((p) => p.text);
          return [];
        })
        .join("")
        .trim();
    }

    if (content?.parts && Array.isArray(content.parts)) {
      return content.parts
        .filter((p) => typeof p?.text === "string")
        .map((p) => p.text)
        .join("")
        .trim();
    }

    return "";
  }

  extractFunctionCall(response) {
    const functionCalls =
      response?.functionCalls || response?.candidates?.[0]?.functionCalls;

    if (Array.isArray(functionCalls) && functionCalls.length)
      return functionCalls[0];

    const candidate = response?.candidates?.[0];
    if (!candidate) return null;

    if (candidate.functionCall) return candidate.functionCall;

    const content = candidate.content;

    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.functionCall) return item.functionCall;
        if (Array.isArray(item.parts)) {
          const fp = item.parts.find((p) => p.functionCall);
          if (fp) return fp.functionCall;
        }
      }
    }

    if (content?.parts && Array.isArray(content.parts))
      return content.parts.find((p) => p.functionCall)?.functionCall || null;

    return null;
  }

  getTextFromStreamChunk(chunk) {
    if (!chunk) return "";

    if (typeof chunk.text === "string") return chunk.text;

    const content = chunk.content;

    if (Array.isArray(content)) {
      return content
        .flatMap((item) => {
          if (typeof item.text === "string") return [item.text];
          if (Array.isArray(item.parts))
            return item.parts
              .filter((p) => typeof p?.text === "string")
              .map((p) => p.text);
          return [];
        })
        .join("");
    }

    if (content?.parts && Array.isArray(content.parts))
      return content.parts
        .filter((p) => typeof p?.text === "string")
        .map((p) => p.text)
        .join("");

    return "";
  }

  buildContents(userMessage, conversationHistory = []) {
    const contents = conversationHistory.map((item) => ({
      role:  item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));

    contents.push({ role: "user", parts: [{ text: userMessage }] });
    return contents;
  }

  async executeFunction(functionCall) {
    const { name } = functionCall;
    const rawArgs  = functionCall.args || functionCall.arguments || {};
    const args     = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
    const handler  = this.functionHandlers[name];

    if (!handler) throw new Error(`Função ${name} não suportada.`);

    const result = await handler(args);
    return { name, args, result };
  }

  buildFollowUpContents({ contents, response, functionCall, result, name }) {
    const assistantCandidate = response.candidates?.[0];
    const assistantContent   = Array.isArray(assistantCandidate?.content)
      ? assistantCandidate.content
      : assistantCandidate?.content?.parts || [];

    return [
      ...contents,
      { role: "model", functionCall, parts: assistantContent },
      {
        role:  "user",
        parts: [
          {
            functionResponse: {
              name,
              response: { content: result },
            },
          },
        ],
      },
    ];
  }

  // ── Verifica se o erro veio do Gemini ──────────────────────────────────────
  isGeminiError(error) {
    return !!error?.geminiType;
  }

  // ── Processamento normal ────────────────────────────────────────────────────

  async processChatMessage(userMessage, conversationHistory = []) {
    try {
      const contents = this.buildContents(userMessage, conversationHistory);

      const response = await generateAIContent(contents, {
        tools: this.toolConfig,
      });

      const functionCall  = this.extractFunctionCall(response);
      const assistantText = this.getTextFromResponse(response);

      if (!functionCall) {
        return {
          success: true,
          message: assistantText || "Como posso ajudar?",
          functionResults: [],
        };
      }

      const { name, args, result } = await this.executeFunction(functionCall);

      const followUpContents = this.buildFollowUpContents({
        contents,
        response,
        functionCall,
        result,
        name,
      });

      const finalResponse = await generateAIContent(followUpContents, {
        tools: this.toolConfig,
      });

      const finalText = this.getTextFromResponse(finalResponse);

      return {
        success: true,
        message: finalText || assistantText || `Função ${name} executada com sucesso.`,
        functionResults: [{ functionName: name, arguments: args, result, functionCall }],
      };
    } catch (error) {
      // Erro classificado do Gemini → mensagem amigável
      if (this.isGeminiError(error)) {
        console.error(`[ChatProcessor] Gemini ${error.geminiType}:`, error.message);
        return {
          success:         false,
          geminiError:     true,
          errorType:       error.geminiType,
          message:         error.message,
          functionResults: [],
        };
      }

      // Erro inesperado
      console.error("[ChatProcessor] Unexpected error:", error);
      return {
        success:         false,
        geminiError:     false,
        message:         "Ocorreu um erro interno. Tente novamente.",
        functionResults: [],
      };
    }
  }

  // ── Processamento stream ────────────────────────────────────────────────────

  async processChatMessageStream(userMessage, conversationHistory = [], onChunk) {
    const contents = this.buildContents(userMessage, conversationHistory);

    // Primeira chamada — verificar function call
    const response = await generateAIContent(contents, {
      tools: this.toolConfig,
    });

    const functionCall  = this.extractFunctionCall(response);
    const assistantText = this.getTextFromResponse(response);
    let   finalText     = "";

    if (functionCall) {
      const { name, args, result } = await this.executeFunction(functionCall);

      const followUpContents = this.buildFollowUpContents({
        contents,
        response,
        functionCall,
        result,
        name,
      });

      const finalStream = await generateAIContentStream(followUpContents, {
        tools: this.toolConfig,
      });

      const iterator =
        typeof finalStream[Symbol.asyncIterator] === "function"
          ? finalStream
          : finalStream.stream;

      for await (const chunk of iterator) {
        const chunkText = this.getTextFromStreamChunk(chunk);
        if (chunkText) {
          finalText += chunkText;
          onChunk(chunkText);
        }
      }

      return {
        success: true,
        message: finalText || assistantText || `Função ${name} executada com sucesso.`,
        functionResults: [{ functionName: name, arguments: args, result, functionCall }],
      };
    }

    // Sem function call — stream direto
    const stream = await generateAIContentStream(contents, {
      tools: this.toolConfig,
    });

    const iterator =
      typeof stream[Symbol.asyncIterator] === "function"
        ? stream
        : stream.stream;

    for await (const chunk of iterator) {
      const chunkText = this.getTextFromStreamChunk(chunk);
      if (chunkText) {
        finalText += chunkText;
        onChunk(chunkText);
      }
    }

    return {
      success:         true,
      message:         finalText,
      functionResults: [],
    };
  }
}
