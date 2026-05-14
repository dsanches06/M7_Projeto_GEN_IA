// ======================================================
// FILE: tag_task.js
// ======================================================

import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo adicionar uma ou mais etiquetas
 * a uma tarefa existente.
 */
class TagTaskFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_tag_task_values",
        description:
          "Adiciona uma ou mais etiquetas (tags) a uma tarefa existente no ClickUp. " +
          "Usa quando o utilizador pede para marcar, etiquetar ou adicionar tags a uma tarefa.",
        parameters: {
          type: "object",
          properties: {
            task_id: {
              type: "integer",
              description: "ID numérico da tarefa",
            },
            tag_ids: {
              type: "array",
              items: { type: "integer" },
              description:
                "Lista de IDs das etiquetas a adicionar. " +
                "Ex: [1, 4] para Urgente + Bug.",
            },
          },
          required: ["task_id", "tag_ids"],
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    const task_id = this.parseNumber(args.task_id ?? args.taskId, 0);

    // Normaliza tag_ids: aceita array, número único ou string separada por vírgula
    let tag_ids = [];
    if (Array.isArray(args.tag_ids)) {
      tag_ids = args.tag_ids.map(Number).filter(n => n > 0);
    } else if (args.tag_id != null) {
      tag_ids = [this.parseNumber(args.tag_id, 0)].filter(n => n > 0);
    } else if (typeof args.tag_ids === "string") {
      tag_ids = args.tag_ids.split(",").map(s => Number(s.trim())).filter(n => n > 0);
    }

    return { task_id, tag_ids };
  }
}

// Singleton
const tagTaskFunction = new TagTaskFunction();

export const setTagTaskValuesFunctionDeclaration =
  tagTaskFunction.getDeclaration();

export const functionDeclarations = [setTagTaskValuesFunctionDeclaration];

export const setTagTaskValues =
  tagTaskFunction.execute.bind(tagTaskFunction);
