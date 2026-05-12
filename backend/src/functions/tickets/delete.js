import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

class DeleteTicketFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_delete_ticket_values",
      description:
        "Elimina (apaga permanentemente) um ticket existente no ClickUp. " +
        "Usa quando o utilizador pede para apagar, remover ou eliminar um ticket.",
      properties: {
        ticket_id: {
          type: Type.INTEGER,
          description: "ID numérico do ticket a eliminar",
        },
      },
      required: ["ticket_id"],
    });
  }

  mapValues(args = {}) {
    return {
      ticket_id: this.parseNumber(args.ticket_id ?? args.ticketId, 0),
    };
  }
}

const deleteTicketFunction = new DeleteTicketFunction();
export const setDeleteTicketValuesFunctionDeclaration = deleteTicketFunction.getDeclaration();
export const functionDeclarations = [setDeleteTicketValuesFunctionDeclaration];
export const setDeleteTicketValues = deleteTicketFunction.execute.bind(deleteTicketFunction);
