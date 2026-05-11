import { Type } from "@google/genai";
import { BaseFunction } from "../../models/CRUD/BaseFunction.js";

class DeleteTaskFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_delete_task_values",
      description:
        "Elimina (apaga permanentemente) uma tarefa existente no ClickUp. " +
        "Usa quando o utilizador pede para apagar, remover ou eliminar uma tarefa.",
      properties: {
        task_id: {
          type: Type.INTEGER,
          description: "ID numérico da tarefa a eliminar",
        },
      },
      required: ["task_id"],
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
