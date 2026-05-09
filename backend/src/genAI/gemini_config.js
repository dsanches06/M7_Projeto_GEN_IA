import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import createSystemPrompt from "./createSystemPrompt.js";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables.");
  process.exit(1);
}

if (!process.env.MODEL_NAME) {
  console.error("MODEL_NAME is not defined in environment variables.");
  process.exit(1);
}

// Criar instância do modelo
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = process.env.MODEL_NAME || "gemini-2.5-flash-lite";

/**
 * Função Genérica para gerar conteúdo
 */
const generateAIContent = async (contents, options = {}) => {
  const {
    systemInstruction = createSystemPrompt(),
    temperature = 0.25,
    tools = null, // Para passar function declarations
    ...extraConfig
  } = options;

  try {
    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        temperature,
        tools: tools ? [{ functionDeclarations: tools }] : undefined,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
          },
        },
        ...extraConfig,
      },
    });

    return result;
  } catch (error) {
    console.error("Erro ao gerar conteúdo IA:", error);
    throw error;
  }
};

export const generateAIContentStream = async (contents, options = {}) => {
  const {
    systemInstruction = createSystemPrompt(),
    temperature = 0.25,
    tools = null,
    ...extraConfig
  } = options;

  try {
    const result = await genAI.models.generateContentStream({
      model: MODEL_NAME,
      contents,
      config: {
        systemInstruction,
        temperature,
        tools: tools ? [{ functionDeclarations: tools }] : undefined,
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
          },
        },
        ...extraConfig,
      },
    });

    return result;
  } catch (error) {
    console.error("Erro ao gerar conteúdo IA (stream):", error);
    throw error;
  }
};

export default generateAIContent;
