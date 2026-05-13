// ======================================================
// FILE: assign_task.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo atribuir uma tarefa existente a um utilizador.
 * Usada quando o utilizador pede para delegar/atribuir uma tarefa a uma pessoa.
 */
class AssignTaskFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_assign_task_values",

      description:
        "Atribui uma tarefa existente a um utilizador no ClickUp. " +
        "Usa apenas quando a tarefa JÁ EXISTE e tem task_id válido. " +
        "Não use para atribuição imediata se o pedido envolver criação de tarefa no mesmo texto.",

      properties: {
        task_id: {
          type: Type.INTEGER,
          description: "ID numérico da tarefa a atribuir",
        },
        user_id: {
          type: Type.INTEGER,
          description: "ID numérico do utilizador destinatário",
        },
      },

      required: ["task_id", "user_id"],
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    return {
      task_id: this.parseNumber(args.task_id ?? args.taskId, 0),
      user_id: this.parseNumber(args.user_id ?? args.userId, 0),
    };
  }
}

// Singleton
const assignTaskFunction = new AssignTaskFunction();

export const setAssignTaskValuesFunctionDeclaration =
  assignTaskFunction.getDeclaration();

export const functionDeclarations = [setAssignTaskValuesFunctionDeclaration];

export const setAssignTaskValues =
  assignTaskFunction.execute.bind(assignTaskFunction);
