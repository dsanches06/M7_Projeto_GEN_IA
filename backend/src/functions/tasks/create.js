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
          description: "Título da tarefa",
        },
        description: {
          type: Type.STRING,
          description: "Descrição detalhada da tarefa",
        },
        types_id: {
          type: Type.INTEGER,
          description: "ID do tipo da tarefa",
        },
        status_id: {
          type: Type.INTEGER,
          description: "ID do status da tarefa",
        },
        priority_id: {
          type: Type.INTEGER,
          description: "ID da prioridade",
        },
        category_id: {
          type: Type.INTEGER,
          description: "ID da categoria",
        },
        project_id: {
          type: Type.INTEGER,
          description: "ID do projeto",
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
      types_id,
      status_id,
      priority_id,
      category_id,
      project_id,
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

      types_id: this.parseNumber(
        types_id,
        this.parseNumber(args.type_id, this.parseNumber(args.typeId, 1))
      ),
      status_id: this.parseNumber(status_id, this.parseNumber(args.statusId, 1)),
      priority_id: this.parseNumber(priority_id, this.parseNumber(args.priorityId, 1)),
      category_id: this.parseNumber(category_id, this.parseNumber(args.categoryId, 1)),
      project_id: this.parseNumber(project_id, this.parseNumber(args.projectId, 1)),

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
