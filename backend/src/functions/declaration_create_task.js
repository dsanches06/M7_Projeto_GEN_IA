import { Type } from "@google/genai";

// Define a função em que o modelo pode chamar para controlar as tarefas
export const setTaskValuesFunctionDeclaration = {
  name: "set_create_task_values",
  description: "Define os valores para criar uma tarefa no ClickUp",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Título da tarefa, deve ser uma string curta e descritiva",
      },
      description: {
        type: Type.STRING,
        description:
          "Descrição detalhada da tarefa, pode incluir requisitos, passos ou informações adicionais",
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
        description: "ID da prioridade da tarefa",
      },
      category_id: {
        type: Type.INTEGER,
        description: "ID da categoria da tarefa",
      },
      project_id: {
        type: Type.INTEGER,
        description: "ID do projeto ao qual a tarefa pertence",
      },
      created_at: {
        type: Type.STRING,
        format: "date-time",
        description: "Data de criação da tarefa",
      },
      due_date: {
        type: Type.STRING,
        format: "date-time",
        description: "Data de vencimento da tarefa",
      },
      completed_at: {
        type: Type.STRING,
        format: "date-time",
        description: "Data de conclusão da tarefa",
      },
      estimated_hours: {
        type: Type.NUMBER,
        format: "decimal",
        description: "Horas estimadas para conclusão da tarefa",
      },
    },
  },
};

// Lista de declarações de funções disponíveis para o modelo
export const functionDeclarations = [setTaskValuesFunctionDeclaration];

const parseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const number = Number(value);
  return Number.isNaN(number) ? fallback : number;
};

// Função que será chamada pelo modelo para criar a tarefa, recebe os valores definidos na função acima e retorna um objeto com esses valores
export function setCreateTaskValues(args = {}) {
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
  } = args;

  return {
    title: title?.toString().trim() || "",
    description: description?.toString().trim() || "",
    types_id: parseNumber(types_id, parseNumber(args.type_id, parseNumber(args.typeId, 1))),
    status_id: parseNumber(status_id, parseNumber(args.statusId, 1)),
    priority_id: parseNumber(priority_id, parseNumber(args.priorityId, 1)),
    category_id: parseNumber(category_id, parseNumber(args.categoryId, 1)),
    project_id: parseNumber(project_id, parseNumber(args.projectId, 1)),
    created_at: created_at || args.createdAt || new Date().toISOString(),
    due_date: due_date || args.dueDate || null,
    completed_at: completed_at || args.completedAt || null,
    estimated_hours: parseNumber(estimated_hours, parseNumber(args.estimatedHours, 0)),
  };
}
