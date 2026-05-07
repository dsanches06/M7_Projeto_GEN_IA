import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Criar instância do modelo
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "gemini-3.1-flash-lite-preview";

/**
 * Prompt do Sistema
 */
function createSystemPrompt() {
  return `És o ClickBot, um assistente para criar, editar, atualizar, remover e atribuir tarefas no ClickUp.
- Responde de forma clara e direta.
- Quando o utilizador pedir para criar, editar, atualizar, remover ou assinalar uma tarefa, escolhe a declaração de função correta entre as disponíveis e usa-a com argumentos JSON válidos.
- Se o pedido envolver atribuir responsabilidade, inclui o utilizador que deve ser assinado na tarefa.
- Usa apenas as funções declaradas, sem inventar nomes novos.
- Não respondas com markdown, apenas texto limpo ou um objecto JSON quando solicitado.
- Se não houver necessidade de chamar uma função, responde normalmente como assistente.`;
}

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
      systemInstruction: systemInstruction,
      contents,
      tools: tools,
      generationConfig: {
        temperature,
        ...extraConfig,
      },
    });

    return result.response;
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
      systemInstruction: systemInstruction,
      contents,
      tools: tools,
      generationConfig: {
        temperature,
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
