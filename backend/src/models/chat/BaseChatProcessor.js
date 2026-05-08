// ======================================================
// FILE: base_chat_processor.js
// ======================================================

import generateAIContent, {
  generateAIContentStream,
} from "../../genAI/gemini_config.js";
/**
 * Classe Base Genérica
 * Reutilizável para qualquer módulo:
 * - tasks
 * - notifications
 * - comments
 * - tickets
 * - etc
 */
export class BaseChatProcessor {
  constructor({ toolConfig = [], functionHandlers = {} }) {
    this.toolConfig = toolConfig;
    this.functionHandlers = functionHandlers;
  }

  // ======================================================
  // UTILITÁRIOS
  // ======================================================

  getTextFromResponse(response) {
    if (!response?.candidates?.length) return "";

    const candidate = response.candidates[0];

    if (typeof candidate.text === "string") {
      return candidate.text.trim();
    }

    const content = candidate.content;

    if (Array.isArray(content)) {
      return content
        .flatMap((item) => {
          if (typeof item.text === "string") return [item.text];

          if (Array.isArray(item.parts)) {
            return item.parts
              .filter((part) => typeof part?.text === "string")
              .map((part) => part.text);
          }

          return [];
        })
        .join("")
        .trim();
    }

    if (content?.parts && Array.isArray(content.parts)) {
      return content.parts
        .filter((part) => typeof part?.text === "string")
        .map((part) => part.text)
        .join("")
        .trim();
    }

    return "";
  }

  extractFunctionCall(response) {
    const functionCalls =
      response?.functionCalls || response?.candidates?.[0]?.functionCalls;

    if (Array.isArray(functionCalls) && functionCalls.length) {
      return functionCalls[0];
    }

    const candidate = response?.candidates?.[0];

    if (!candidate) return null;

    if (candidate.functionCall) {
      return candidate.functionCall;
    }

    const content = candidate.content;

    if (Array.isArray(content)) {
      for (const item of content) {
        if (item.functionCall) {
          return item.functionCall;
        }

        if (Array.isArray(item.parts)) {
          const functionPart = item.parts.find((part) => part.functionCall);

          if (functionPart) {
            return functionPart.functionCall;
          }
        }
      }
    }

    if (content?.parts && Array.isArray(content.parts)) {
      return (
        content.parts.find((part) => part.functionCall)?.functionCall || null
      );
    }

    return null;
  }

  getTextFromStreamChunk(chunk) {
    if (!chunk) return "";

    if (typeof chunk.text === "string") {
      return chunk.text;
    }

    const content = chunk.content;

    if (Array.isArray(content)) {
      return content
        .flatMap((item) => {
          if (typeof item.text === "string") {
            return [item.text];
          }

          if (Array.isArray(item.parts)) {
            return item.parts
              .filter((part) => typeof part?.text === "string")
              .map((part) => part.text);
          }

          return [];
        })
        .join("");
    }

    if (content?.parts && Array.isArray(content.parts)) {
      return content.parts
        .filter((part) => typeof part?.text === "string")
        .map((part) => part.text)
        .join("");
    }

    return "";
  }

  buildContents(userMessage, conversationHistory = []) {
    const contents = conversationHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    return contents;
  }

  async executeFunction(functionCall) {
    const { name } = functionCall;

    const rawArgs = functionCall.args || functionCall.arguments || {};

    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

    const handler = this.functionHandlers[name];

    if (!handler) {
      throw new Error(`Função ${name} não suportada.`);
    }

    const result = await handler(args);

    return {
      name,
      args,
      result,
    };
  }

  buildFollowUpContents({ contents, response, functionCall, result, name }) {
    const assistantCandidate = response.candidates?.[0];

    const assistantContent = Array.isArray(assistantCandidate?.content)
      ? assistantCandidate.content
      : assistantCandidate?.content?.parts || [];

    return [
      ...contents,
      {
        role: "model",
        functionCall,
        parts: assistantContent,
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name,
              response: {
                content: result,
              },
            },
          },
        ],
      },
    ];
  }

  // ======================================================
  // PROCESSAMENTO NORMAL
  // ======================================================

  async processChatMessage(userMessage, conversationHistory = []) {
    try {
      const contents = this.buildContents(userMessage, conversationHistory);

      const response = await generateAIContent(contents, {
        tools: this.toolConfig,
      });

      const functionCall = this.extractFunctionCall(response);

      const assistantText = this.getTextFromResponse(response);

      // ==========================================
      // SEM FUNCTION CALL
      // ==========================================

      if (!functionCall) {
        return {
          success: true,
          message: assistantText || "Como posso ajudar?",
          functionResults: [],
        };
      }

      // ==========================================
      // COM FUNCTION CALL
      // ==========================================

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
        message:
          finalText || assistantText || `Função ${name} executada com sucesso.`,
        functionResults: [
          {
            functionName: name,
            arguments: args,
            result,
            functionCall,
          },
        ],
      };
    } catch (error) {
      console.error("Erro no processamento:", error);

      return {
        success: false,
        message: "Ocorreu um erro interno.",
      };
    }
  }

  // ======================================================
  // PROCESSAMENTO STREAM
  // ======================================================

  async processChatMessageStream(
    userMessage,
    conversationHistory = [],
    onChunk,
  ) {
    try {
      const contents = this.buildContents(userMessage, conversationHistory);

      const response = await generateAIContent(contents, {
        tools: this.toolConfig,
      });

      const functionCall = this.extractFunctionCall(response);

      const assistantText = this.getTextFromResponse(response);

      let finalText = "";

      // ==========================================
      // COM FUNCTION CALL
      // ==========================================

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

        const finalStreamIterator =
          typeof finalStream[Symbol.asyncIterator] === "function"
            ? finalStream
            : finalStream.stream;

        for await (const chunk of finalStreamIterator) {
          const chunkText = this.getTextFromStreamChunk(chunk);

          if (chunkText) {
            finalText += chunkText;
            onChunk(chunkText);
          }
        }

        return {
          success: true,
          message:
            finalText ||
            assistantText ||
            `Função ${name} executada com sucesso.`,
          functionResults: [
            {
              functionName: name,
              arguments: args,
              result,
              functionCall,
            },
          ],
        };
      }

      // ==========================================
      // STREAM NORMAL
      // ==========================================

      const stream = await generateAIContentStream(contents, {
        tools: this.toolConfig,
      });

      const streamIterator =
        typeof stream[Symbol.asyncIterator] === "function"
          ? stream
          : stream.stream;

      for await (const chunk of streamIterator) {
        const chunkText = this.getTextFromStreamChunk(chunk);

        if (chunkText) {
          finalText += chunkText;
          onChunk(chunkText);
        }
      }

      return {
        success: true,
        message: finalText,
        functionResults: [],
      };
    } catch (error) {
      console.error("Erro no processamento stream:", error);

      throw error;
    }
  }
}
