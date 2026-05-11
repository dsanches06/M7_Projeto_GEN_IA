import { Type } from "@google/genai";
import { BaseFunction } from "../../models/CRUD/BaseFunction.js";

class UpdateTaskFunction extends BaseFunction {
  constructor() {
    super({
      functionName: "set_update_task_values",
      description:
        "Atualiza campos de uma tarefa existente no ClickUp (título, descrição, prioridade, projeto, etc.). " +
        "Usa quando o utilizador quer editar ou modificar uma tarefa já criada. " +
        "Envia APENAS os campos que devem ser alterados (além de task_id).",
      properties: {
        task_id: {
          type: Type.INTEGER,
          description: "ID numérico da tarefa a atualizar (obrigatório)",
        },
        title: {
          type: Type.STRING,
          description: "Novo título da tarefa",
        },
        description: {
          type: Type.STRING,
          description: "Nova descrição da tarefa",
        },
        types_id: {
          type: Type.INTEGER,
          description: "Novo tipo: 1=Feature, 2=Bug, 3=Task",
        },
        priority_id: {
          type: Type.INTEGER,
          description: "Nova prioridade: 1=Baixa, 2=Média, 3=Alta",
        },
        category_id: {
          type: Type.INTEGER,
          description: "Nova categoria: 1=WORKED, 2=PERSONAL, 3=STUDY",
        },
        project_id: {
          type: Type.INTEGER,
          description: "Novo projeto: 1=Portal E-learning, 2=App Logística, 3=Data Lake Cloud",
        },
        due_date: {
          type: Type.STRING,
          format: "date-time",
          description: "Nova data limite (ex: 2026-06-01)",
        },
        estimated_hours: {
          type: Type.NUMBER,
          description: "Novas horas estimadas",
        },
      },
      required: ["task_id"],
    });
  }

  mapValues(args = {}) {
    const result = {
      task_id: this.parseNumber(args.task_id ?? args.taskId, 0),
    };
    // Only include fields actually provided
    if (args.title            !== undefined) result.title            = this.parseString(args.title);
    if (args.description      !== undefined) result.description      = this.parseString(args.description);
    if (args.types_id         !== undefined) result.types_id         = this.parseNumber(args.types_id, 1);
    if (args.priority_id      !== undefined) result.priority_id      = this.parseNumber(args.priority_id, 1);
    if (args.category_id      !== undefined) result.category_id      = this.parseNumber(args.category_id, 1);
    if (args.project_id       !== undefined) result.project_id       = this.parseNumber(args.project_id, 1);
    if (args.due_date         !== undefined) result.due_date         = args.due_date;
    if (args.estimated_hours  !== undefined) result.estimated_hours  = this.parseNumber(args.estimated_hours, 0);
    return result;
  }
}

const updateTaskFunction = new UpdateTaskFunction();
export const setUpdateTaskValuesFunctionDeclaration = updateTaskFunction.getDeclaration();
export const functionDeclarations = [setUpdateTaskValuesFunctionDeclaration];
export const setUpdateTaskValues = updateTaskFunction.execute.bind(updateTaskFunction);
