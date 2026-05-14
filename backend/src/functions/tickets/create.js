// ======================================================
// FILE: create_ticket.js
// ======================================================

import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo criar tickets/issues.
 * Usada quando o utilizador reporta um problema ou solicita uma correção.
 */
class CreateTicketFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_create_ticket_values",
        description: "Cria um novo ticket no ClickUp",
        parameters: {
          type: "object",
          properties: {
            user_id: {
              type: "integer",
              description: "ID do utilizador que reporta o ticket",
            },
            user_report: {
              type: "string",
              description: "Relato do utilizador sobre o problema ou solicitação",
            },
            error_type: {
              type: "string",
              description: "Tipo de erro",
            },
            severity: {
              type: "integer",
              description: "ID do nível de severidade do ticket (1-10)",
            },
            fix_suggestion: {
              type: "string",
              description: "Sugestão de correção",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
          },
          required: ["user_id", "user_report"],
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  // Mapeia os argumentos recebidos para os campos esperados pela função
  mapValues(args = {}) {
    const {
      user_id,
      user_report,
      error_type,
      severity,
      fix_suggestion,
      created_at,
    } = args;

    const resolvedUserId =
      user_id != null
        ? this.parseNumber(user_id, 0)
        : args.userId != null
        ? this.parseNumber(args.userId, 0)
        : 0;

    const resolvedUserReport =
      user_report != null ? user_report : args.userReport ?? "";

    const resolvedErrorType =
      error_type != null ? error_type : args.errorType ?? "";

    const resolvedFixSuggestion =
      fix_suggestion != null ? fix_suggestion : args.fixSuggestion ?? "";

    return {
      user_id: resolvedUserId,
      user_report: this.parseString(resolvedUserReport),
      error_type: this.parseString(resolvedErrorType),
      severity: this.parseNumber(severity, this.parseNumber(args.severity, 10)),
      fix_suggestion: this.parseString(resolvedFixSuggestion),
      created_at: created_at || args.createdAt || this.currentDate(),
    };
  }
}

//singleton para exportar a função e evitar múltiplas instâncias
const createTicketFunction = new CreateTicketFunction();

// Exporta a declaração da função para que o modelo possa utilizá-la
export const setTicketValuesFunctionDeclaration =
  createTicketFunction.getDeclaration();

// Lista de declarações de funções disponíveis para o modelo
export const functionDeclarations = [setTicketValuesFunctionDeclaration];

// Função que será chamada pelo modelo para criar o ticket, recebe os valores definidos na função acima e retorna um objeto com esses valores
export const setCreateTicketValues =
  createTicketFunction.execute.bind(createTicketFunction);
