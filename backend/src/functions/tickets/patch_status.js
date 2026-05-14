import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo alterar o status de um ticket.
 * Usada quando o utilizador pede para mover ou alterar o estado de um ticket.
 */
class PatchStatusTicketFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_patch_status_ticket_values",
        description:
          "Altera o estado/status de um ticket existente no ClickUp. " +
          "Usa quando o utilizador pede para mudar, atualizar ou fechar um ticket.",
        parameters: {
          type: "object",
          properties: {
            ticket_id: {
              type: "integer",
              description: "ID numérico do ticket",
            },
            status: {
              type: "string",
              description:
                "Novo estado do ticket: " +
                "'open' (aberto), " +
                "'in_progress' (em progresso), " +
                "'resolved' (resolvido), " +
                "'closed' (fechado)",
            },
          },
          required: ["ticket_id", "status"],
        },
      },
    });
  }

  mapValues(args = {}) {
    const STATUS_MAP = {
      aberto:       "open",
      "em progresso": "in_progress",
      "em curso":   "in_progress",
      resolvido:    "resolved",
      fechado:      "closed",
      closed:       "closed",
      resolved:     "resolved",
      open:         "open",
      in_progress:  "in_progress",
    };
    const rawStatus =
      (args.status || args.ticketStatus || "open").toString().toLowerCase().trim();
    return {
      ticket_id: this.parseNumber(args.ticket_id ?? args.ticketId, 0),
      status: STATUS_MAP[rawStatus] || rawStatus,
    };
  }
}

const patchStatusTicketFunction = new PatchStatusTicketFunction();
export const setPatchStatusTicketValuesFunctionDeclaration = patchStatusTicketFunction.getDeclaration();
export const functionDeclarations = [setPatchStatusTicketValuesFunctionDeclaration];
export const setPatchStatusTicketValues = patchStatusTicketFunction.execute.bind(patchStatusTicketFunction);
