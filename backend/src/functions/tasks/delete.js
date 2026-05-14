import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo eliminar uma tarefa existente.
 * Usada quando o utilizador pede para apagar uma tarefa.
 */
class DeleteTaskFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_delete_task_values",
        description:
          "Elimina (apaga permanentemente) uma tarefa existente no ClickUp. " +
          "Usa quando o utilizador pede para apagar, remover ou eliminar uma tarefa.",
        parameters: {
          type: "object",
          properties: {
            task_id: {
              type: "integer",
              description: "ID numérico da tarefa a eliminar",
            },
          },
          required: ["task_id"],
        },
      },
    });
  }

  mapValues(args = {}) {
    return {
      task_id: this.parseNumber(args.task_id ?? args.taskId, 0),
    };
  }
}

const deleteTaskFunction = new DeleteTaskFunction();
export const setDeleteTaskValuesFunctionDeclaration = deleteTaskFunction.getDeclaration();
export const functionDeclarations = [setDeleteTaskValuesFunctionDeclaration];
export const setDeleteTaskValues = deleteTaskFunction.execute.bind(deleteTaskFunction);
