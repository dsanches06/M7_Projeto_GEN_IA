import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

class UpdateTicketFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_update_ticket_values",
      description:
        "Atualiza campos de um ticket existente no ClickUp. " +
        "Usa quando o utilizador quer editar a descrição, tipo de erro, severidade ou sugestão de correção de um ticket.",
      properties: {
        ticket_id: {
          type: Type.INTEGER,
          description: "ID numérico do ticket a atualizar (obrigatório)",
        },
        user_report: {
          type: Type.STRING,
          description: "Novo relato do utilizador",
        },
        error_type: {
          type: Type.STRING,
          description: "Novo tipo de erro (API, Database, UI, etc.)",
        },
        severity: {
          type: Type.INTEGER,
          description: "Nova severidade (1-10)",
        },
        fix_suggestion: {
          type: Type.STRING,
          description: "Nova sugestão de correção",
        },
      },
      required: ["ticket_id"],
    });
  }

  mapValues(args = {}) {
    const result = {
      ticket_id: this.parseNumber(args.ticket_id ?? args.ticketId, 0),
    };
    if (args.user_report    !== undefined) result.user_report    = this.parseString(args.user_report);
    if (args.error_type     !== undefined) result.error_type     = this.parseString(args.error_type);
    if (args.severity       !== undefined) result.severity       = this.parseNumber(args.severity, 5);
    if (args.fix_suggestion !== undefined) result.fix_suggestion = this.parseString(args.fix_suggestion);
    return result;
  }
}

const updateTicketFunction = new UpdateTicketFunction();
export const setUpdateTicketValuesFunctionDeclaration = updateTicketFunction.getDeclaration();
export const functionDeclarations = [setUpdateTicketValuesFunctionDeclaration];
export const setUpdateTicketValues = updateTicketFunction.execute.bind(updateTicketFunction);
