
// ======================================================
// FILE: create_notification.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/CRUD/BaseFunction.js";

// Define a função em que o modelo pode chamar para controlar as notificações
class CreateNotificationFunction extends BaseFunction {
  constructor() {
    super({
      functionName:
        "set_create_notification_values",

      description:
        "Define os valores para criar uma notificação no ClickUp",

      properties: {
        user_id: {
          type: Type.INTEGER,
          description:
            "ID do utilizador",
        },

        title: {
          type: Type.STRING,
          description:
            "Título da notificação",
        },

        message: {
          type: Type.STRING,
          description:
            "Mensagem da notificação",
        },

        is_read: {
          type: Type.STRING,
          description:
            "Se foi lida",
        },

        sent_at: {
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
      user_id,
      title,
      message,
      is_read,
      sent_at,
    } = args;

    return {
      user_id:
        user_id ||
        args.userId ||
        "",

      title:
        this.parseString(title),

      message:
        this.parseString(message),

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


