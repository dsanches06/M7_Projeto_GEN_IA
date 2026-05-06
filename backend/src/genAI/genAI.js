import { GoogleGenAI } from "@google/genai";
import { setTaskValuesFunctionDeclaration, setCreateTaskValues } from "../functions/functions_declarations.js";
import dotenv from "dotenv";

dotenv.config();

// Mapa de funções disponíveis para executar
const functionHandlers = {
  set_create_task_values: setCreateTaskValues,
};

// Configuração do modelo com function declarations
const config = {
  // tools: [
  //   {
  //     functionDeclarations: [setTaskValuesFunctionDeclaration],
  //   },
  // ],
};

// Criar instância do modelo
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = "models/gemini-pro";

/**
 * Processa uma mensagem de chat com function calls
 * @param {string} userMessage - Mensagem do usuário
 * @param {Array} conversationHistory - Histórico da conversa (opcional)
 * @returns {Object} - Resposta do modelo com resultados das funções
 */
export async function processChatMessage(userMessage, conversationHistory = []) {
  try {
    // Simulação temporária - resposta mock
    console.log('Mensagem recebida:', userMessage);

    // Verificar se é uma mensagem sobre criar tarefa
    if (userMessage.toLowerCase().includes('criar') && userMessage.toLowerCase().includes('tarefa')) {
      // Simular function call
      const mockResult = {
        title: "Tarefa de exemplo",
        description: "Descrição da tarefa criada via chat",
        types_id: 1,
        status_id: 1,
        priority_id: 2,
        category_id: 1,
        project_id: 1,
        created_at: new Date().toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: null,
        estimated_hours: 8
      };

      return {
        success: true,
        message: "Tarefa criada com sucesso! Use o botão abaixo para salvá-la no sistema.",
        functionResults: [{
          functionName: "set_create_task_values",
          result: mockResult,
        }],
        updatedHistory: [],
      };
    }

    // Resposta padrão
    return {
      success: true,
      message: `Entendi sua mensagem: "${userMessage}". Como posso ajudar com tarefas hoje?`,
      functionResults: [],
      updatedHistory: [],
  }
}

/**
 * Registra um novo handler de função
 * @param {string} functionName - Nome da função
 * @param {Function} handler - Função handler
 */
export function registerFunctionHandler(functionName, handler) {
  functionHandlers[functionName] = handler;
}

export { genAI, config, MODEL_NAME };
