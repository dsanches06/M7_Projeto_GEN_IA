
// ======================================================
// FILE: create_notification.js
// ======================================================

import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo criar notificações.
 * Usada quando precisa notificar um utilizador.
 */
class CreateNotificationFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_create_notification_values",
        description: "Cria uma nova notificação no ClickUp",
        parameters: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "ID do utilizador",
            },
            title: {
              type: "string",
              description: "Título da notificação",
            },
            message: {
              type: "string",
              description: "Mensagem da notificação",
            },
            is_read: {
              type: "boolean",
              description: "Se foi lida",
            },
            sent_at: {
              type: "string",
              format: "date-time",
              description: "Data de envio",
            },
          },
          required: ["user_id", "title", "message"],
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


