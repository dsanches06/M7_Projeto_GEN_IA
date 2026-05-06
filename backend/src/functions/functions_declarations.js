import { Type } from "@google/genai";

// Define a função em que o modelc é chamado para controlar as tarefas

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

//função que será chamada pelo model para criar a tarefa, recebe os valores definidos na função acima e retorna um objeto com esses valores
export function setCreateTaskValues(
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
) {
  return {
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
  };
}
