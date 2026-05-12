// ======================================================
// FILE: create_task.js
// ======================================================

import { Type } from "@google/genai";
import { BaseFunction } from "../../models/BaseFunction.js";

class CreateTaskFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_create_task_values",

      description: "Define os valores para criar uma tarefa no ClickUp",

      properties: {
        title: {
          type: Type.STRING,
          description: "Título curto e objetivo da tarefa (não a descrição completa)",
        },
        description: {
          type: Type.STRING,
          description: "Descrição completa e contextualizada da tarefa, elaborada a partir do pedido do utilizador",
        },
        status_id: {
          type: Type.INTEGER,
          description: "ID do status da tarefa",
        },
        priority_id: {
          type: Type.INTEGER,
          description: "ID da prioridade",
        },
        created_at: {
          type: Type.STRING,
          format: "date-time",
          description: "Data de criação",
        },
        due_date: {
          type: Type.STRING,
          format: "date-time",
          description: "Data limite",
        },
        completed_at: {
          type: Type.STRING,
          format: "date-time",
          description: "Data de conclusão",
        },
        estimated_hours: {
          type: Type.NUMBER,
          format: "decimal",
          description: "Horas estimadas",
        },
        // ── Atribuição opcional ─────────────────────────────────────────
        user_id: {
          type: Type.INTEGER,
          description:
            "ID do utilizador a quem atribuir a tarefa imediatamente após a criação. " +
            "Opcional — usa apenas quando o utilizador pede criação E atribuição na mesma mensagem.",
        },
      },
    });
  }

  // ======================================================
  // POLIMORFISMO
  // ======================================================

  mapValues(args = {}) {
    const {
      title,
      description,
      status_id,
      priority_id,
      created_at,
      due_date,
      completed_at,
      estimated_hours,
      user_id,
    } = args;

    // user_id: preserva null se não fornecido (não usa parseNumber que retorna 0)
    const resolvedUserId =
      user_id != null
        ? this.parseNumber(user_id, null)
        : args.userId != null
        ? this.parseNumber(args.userId, null)
        : null;

    return {
      title: this.parseString(title),
      description: this.parseString(description),

      status_id: this.parseNumber(status_id, this.parseNumber(args.statusId, 1)),
      priority_id: this.parseNumber(priority_id, this.parseNumber(args.priorityId, 1)),

      created_at: created_at || args.createdAt || this.currentDate(),
      due_date: due_date || args.dueDate || null,
      completed_at: completed_at || args.completedAt || null,

      estimated_hours: this.parseNumber(
        estimated_hours,
        this.parseNumber(args.estimatedHours, 0)
      ),

      // Passado para o controller tratar automaticamente a atribuição
      user_id: resolvedUserId,
    };
  }
}

const createTaskFunction = new CreateTaskFunction();

export const setTaskValuesFunctionDeclaration = createTaskFunction.getDeclaration();
export const functionDeclarations = [setTaskValuesFunctionDeclaration];
export const setCreateTaskValues = createTaskFunction.execute.bind(createTaskFunction);
