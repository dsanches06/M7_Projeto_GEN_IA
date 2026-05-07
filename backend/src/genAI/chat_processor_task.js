import generateAIContent, { generateAIContentStream } from "./gemini_config.js";
import {
  functionDeclarations,
  setCreateTaskValues,
} from "../functions/declaration_create_task.js";

const functionHandlers = {
  set_create_task_values: setCreateTaskValues,
};

const toolConfig = functionDeclarations;

/**
 * Utilitários para extração de dados da resposta
 */
const getTextFromResponse = (response) => {
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
};

const extractFunctionCall = (response) => {
  const candidate = response?.candidates?.[0];
  if (!candidate) return null;

  if (candidate.functionCall) return candidate.functionCall;

  const content = candidate.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.functionCall) return item.functionCall;
      if (Array.isArray(item.parts)) {
        const functionPart = item.parts.find((part) => part.functionCall);
        if (functionPart) return functionPart.functionCall;
      }
    }
  }

  if (content?.parts && Array.isArray(content.parts)) {
    return (
      content.parts.find((part) => part.functionCall)?.functionCall || null
    );
  }

  return null;
};

/**
 * Processa a mensagem do chat
 */
export async function processChatMessage(
  userMessage,
  conversationHistory = [],
) {
  try {
    // 1. Construir Histórico (User -> Model)
    const contents = conversationHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    // 2. Primeira Chamada à IA
    const response = await generateAIContent(contents, { tools: toolConfig });
    const functionCall = extractFunctionCall(response);
    const assistantText = getTextFromResponse(response);

    // 3. Verificar se houve chamada de função
    if (functionCall) {
      const { name, args } = functionCall;
      const handler = functionHandlers[name];

      if (!handler) throw new Error(`Função ${name} não suportada.`);

      // Executar a função real (DB/API)
      const result = await handler(...Object.values(args));

      const assistantCandidate = response.candidates?.[0];
      const assistantContent = Array.isArray(assistantCandidate?.content)
        ? assistantCandidate.content
        : assistantCandidate?.content?.parts || [];

      // 4. Preparar follow-up enviando o resultado da função
      const followUpContents = [
        ...contents,
        {
          role: "assistant",
          functionCall,
          parts: assistantContent,
        },
        {
          role: "user",
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

      // 5. Segunda Chamada para resposta final ao utilizador
      const finalResponse = await generateAIContent(followUpContents, {
        tools: toolConfig,
      });

      const finalText = getTextFromResponse(finalResponse);
      return {
        success: true,
        message:
          finalText || assistantText || `Função ${name} executada com sucesso.`,
        functionResults: [
          { functionName: name, arguments: args, result, functionCall },
        ],
      };
    }

    return {
      success: true,
      message: assistantText || "Como posso ajudar?",
      functionResults: [],
    };
  } catch (error) {
    console.error("Erro no processamento:", error);
    return { success: false, message: "Ocorreu um erro interno." };
  }
}

const getTextFromStreamChunk = (chunk) => {
  if (!chunk) return "";
  if (typeof chunk.text === "string") return chunk.text;

  const content = chunk.content;
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
      .join("");
  }

  if (content?.parts && Array.isArray(content.parts)) {
    return content.parts
      .filter((part) => typeof part?.text === "string")
      .map((part) => part.text)
      .join("");
  }

  return "";
};

export async function processChatMessageStream(
  userMessage,
  conversationHistory = [],
  onChunk,
) {
  try {
    const contents = conversationHistory.map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    }));
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await generateAIContent(contents, { tools: toolConfig });
    const functionCall = extractFunctionCall(response);
    const assistantText = getTextFromResponse(response);

    if (functionCall) {
      const { name, args } = functionCall;
      const handler = functionHandlers[name];

      if (!handler) throw new Error(`Função ${name} não suportada.`);

      const result = await handler(...Object.values(args));

      const assistantCandidate = response.candidates?.[0];
      const assistantContent = Array.isArray(assistantCandidate?.content)
        ? assistantCandidate.content
        : assistantCandidate?.content?.parts || [];

      const followUpContents = [
        ...contents,
        {
          role: "assistant",
          functionCall,
          parts: assistantContent,
        },
        {
          role: "user",
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

      const finalStream = await generateAIContentStream(followUpContents, {
        tools: toolConfig,
      });

      for await (const chunk of finalStream.stream) {
        const chunkText = getTextFromStreamChunk(chunk);
        if (chunkText) onChunk(chunkText);
      }

      return {
        success: true,
        functionResults: [
          { functionName: name, arguments: args, result, functionCall },
        ],
      };
    }

    const stream = await generateAIContentStream(contents, {
      tools: toolConfig,
    });

    for await (const chunk of stream.stream) {
      const chunkText = getTextFromStreamChunk(chunk);
      if (chunkText) onChunk(chunkText);
    }

    return {
      success: true,
      functionResults: [],
    };
  } catch (error) {
    console.error("Erro no processamento stream:", error);
    throw error;
  }
}
