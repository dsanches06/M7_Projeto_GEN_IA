// ======================================================
// FILE: create_task.js
// ======================================================

import { BaseFunction } from "../../models/BaseFunction.js";

/**
 * Função que permite ao modelo criar uma tarefa no ClickUp.
 * Usada quando o utilizador pede para criar uma nova tarefa.
 */
class CreateTaskFunction extends BaseFunction {
  constructor() {
    super({
      type: "function",
      function: {
        name: "set_create_task_values",
        description: "Cria uma nova tarefa no ClickUp com os valores fornecidos",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Título curto e objetivo da tarefa (não a descrição completa)",
            },
            description: {
              type: "string",
              description: "Descrição completa e contextualizada da tarefa, elaborada a partir do pedido do utilizador",
            },
            status_id: {
              type: "integer",
              description: "ID do status da tarefa",
            },
            priority_id: {
              type: "integer",
              description: "ID da prioridade",
            },
            created_at: {
              type: "string",
              format: "date-time",
              description: "Data de criação",
            },
            due_date: {
              type: "string",
              format: "date-time",
              description: "Data limite",
            },
            completed_at: {
              type: "string",
              format: "date-time",
              description: "Data de conclusão",
            },
            estimated_hours: {
              type: "number",
              format: "decimal",
              description: "Horas estimadas",
            },
            user_id: {
              type: "integer",
              description:
                "ID do utilizador a quem atribuir a tarefa imediatamente após a criação. " +
                "Use este campo sempre que o utilizador pede criar e atribuir no mesmo pedido. " +
                "Não use set_assign_task_values em paralelo se já estiver presente.",
            },
          },
          required: ["title", "description"],
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
