import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo atualizar um ticket existente.
 * Usada quando o utilizador pede para editar um ticket.
 */
class UpdateTicketFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_update_ticket_values",
        description:
          "Atualiza campos de um ticket existente no ClickUp. " +
          "Usa quando o utilizador quer editar a descrição, tipo de erro, severidade ou sugestão de correção de um ticket.",
        parameters: {
          type: "object",
          properties: {
            ticket_id: {
              type: "integer",
              description: "ID numérico do ticket a atualizar (obrigatório)",
            },
            user_report: {
              type: "string",
              description: "Novo relato do utilizador",
            },
            error_type: {
              type: "string",
              description: "Novo tipo de erro (API, Database, UI, etc.)",
            },
            severity: {
              type: "integer",
              description: "Nova severidade (1-10)",
            },
            fix_suggestion: {
              type: "string",
              description: "Nova sugestão de correção",
            },
          },
          required: ["ticket_id"],
        },
      },
    });
  }

  mapValues(args = {}) {
    const result = {
      ticket_id: this.parseNumber(args.ticket_id ?? args.ticketId, 0),
    };
    if (args.user_report !== undefined || args.userReport !== undefined)
      result.user_report = this.parseString(args.user_report ?? args.userReport);
    if (args.error_type !== undefined || args.errorType !== undefined)
      result.error_type = this.parseString(args.error_type ?? args.errorType);
    if (args.severity !== undefined)
      result.severity = this.parseNumber(args.severity, 5);
    if (args.fix_suggestion !== undefined || args.fixSuggestion !== undefined)
      result.fix_suggestion = this.parseString(
        args.fix_suggestion ?? args.fixSuggestion,
      );
    return result;
  }
}

const updateTicketFunction = new UpdateTicketFunction();
export const setUpdateTicketValuesFunctionDeclaration = updateTicketFunction.getDeclaration();
export const functionDeclarations = [setUpdateTicketValuesFunctionDeclaration];
export const setUpdateTicketValues = updateTicketFunction.execute.bind(updateTicketFunction);
