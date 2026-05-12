// ======================================================
// FILE: create_summary.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

class CreateSummaryFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_create_summary_values",

      description:
        "Define os valores para criar um resumo de conversa no ClickUp",

      properties: {
        conversation_id: {
          type: Type.INTEGER,
          description: "ID da conversa a resumir",
        },

        original_text: {
          type: Type.STRING,
          description:
            "Texto original completo da conversa (máximo 295 caracteres)",
        },

        summary: {
          type: Type.STRING,
          description:
            "Resumo conciso e claro da conversa (máximo 195 caracteres)",
        },

        created_at: {
          type: Type.STRING,
          format: "date-time",
          description: "Data de criação do resumo",
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    const { conversation_id, original_text, summary, created_at } = args;

    return {
      conversation_id: this.parseNumber(
        conversation_id ?? args.conversationId,
        0
      ),

      original_text: this.parseString(original_text).substring(0, 295),

      summary: this.parseString(summary).substring(0, 195),

      created_at: created_at || args.createdAt || this.currentDate(),
    };
  }
}

// singleton da função para usar na declaração e execução
const createSummaryFunction = new CreateSummaryFunction();

// Exporta a declaração da função para ser usada na configuração do processador de chat
export const setSummaryValuesFunctionDeclaration =
  createSummaryFunction.getDeclaration();

// Lista de declarações de funções disponíveis para o modelo
export const functionDeclarations = [setSummaryValuesFunctionDeclaration];

// Exporta a função de execução para ser chamada pelo processador de chat
export const setCreateSummaryValues =
  createSummaryFunction.execute.bind(createSummaryFunction);
