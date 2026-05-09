
// ======================================================
// FILE: create_notification.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/CRUD/BaseFunction.js";

// Define a função em que o modelo pode chamar para controlar as notificações
class CreateSummaryFunction extends BaseFunction {
  constructor() {
    super({
      functionName:
        "set_create_summary_values",

      description:
        "Define os valores para criar um resumo no ClickUp",

      properties: {
        conversation_id: {
          type: Type.INTEGER,
          description:
            "ID da conversa",
        },

        original_text: {
          type: Type.STRING,
          description:
            "Texto original a ser resumido",
        },

        summary: {
          type: Type.STRING,
          description:
            "resumo",
        },

        create_at: {
          type: Type.STRING,
          format: "date-time",
          description:
            "Data de envio",
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    const {
      conversation_id,
      original_text,
      summary,
      create_at,
    } = args;

    return {
      conversation_id:
        conversation_id ||
        args.conversationId ||
        "",

      original_text:
        this.parseString(original_text),

      summary_message:
        this.parseString(summary_message),

      is_read:
        this.parseBoolean(
          is_read,
          false
        ),

      sent_at:
        sent_at ||
        args.sentAt ||
        this.currentDate(),
    };
  }
}

//singleton da função para usar na declaração e execução
const createNotificationFunction =
  new CreateNotificationFunction();

  // Exporta a declaração da função para ser usada na configuração do processador de chat
export const setNotificationValuesFunctionDeclaration =
  createNotificationFunction.getDeclaration();

  // Lista de declarações de funções disponíveis para o modelo
export const functionDeclarations = [
  setNotificationValuesFunctionDeclaration,
];

// Exporta a função de execução para ser chamada pelo processador de chat quando o modelo chamar a função
export const setCreateNotificationValues =
  createNotificationFunction.execute.bind(
    createNotificationFunction
  );


