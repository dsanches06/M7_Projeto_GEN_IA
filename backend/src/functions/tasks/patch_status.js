import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo alterar o status de uma tarefa.
 * Usada quando o utilizador pede para mover ou alterar o estado de uma tarefa.
 */
class PatchStatusTaskFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_patch_status_task_values",
        description:
          "Atualiza o status/estado de uma tarefa existente no ClickUp. " +
          "Usa quando o utilizador pede para mover, alterar, mudar ou atualizar " +
          "o estado de uma tarefa existente.",
        parameters: {
          type: "object",
          properties: {
            task_id: {
              type: "integer",
              description: "ID numérico da tarefa a atualizar",
            },
            status_id: {
              type: "integer",
              description:
                "ID do novo status: 1=CREATED, 2=ASSIGNED, 3=IN_PROGRESS, " +
                "4=BLOCKED, 5=COMPLETED, 6=ARCHIVED",
            },
          },
          required: ["task_id", "status_id"],
        },
      },
    });
  }

  mapValues(args = {}) {
    return {
      task_id:   this.parseNumber(args.task_id   ?? args.taskId,   0),
      status_id: this.parseNumber(args.status_id ?? args.statusId, 1),
    };
  }
}

const patchStatusTaskFunction = new PatchStatusTaskFunction();

export const setPatchStatusTaskValuesFunctionDeclaration =
  patchStatusTaskFunction.getDeclaration();

export const functionDeclarations = [setPatchStatusTaskValuesFunctionDeclaration];

export const setPatchStatusTaskValues =
  patchStatusTaskFunction.execute.bind(patchStatusTaskFunction);
