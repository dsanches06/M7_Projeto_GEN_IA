// Modelo de dados para uma tarefa
export class Task {
  constructor({
    title = "",
    description = "",
    types_id = 1,
    status_id = 1,       // 1 = CREATED
    priority_id = 1,     // 1 = Baixa
    category_id = 1,
    project_id = 1,
    created_at = new Date().toISOString(),
    due_date = new Date().toISOString(),
    completed_at = null,
    estimated_hours = 0,
    assignee = "Não atribuído",
  } = {}) {
    this.title = title;
    this.description = description;
    this.types_id = types_id;
    this.status_id = status_id;
    this.priority_id = priority_id;
    this.category_id = category_id;
    this.project_id = project_id;
    this.created_at = created_at;
    this.due_date = due_date;
    this.completed_at = completed_at;
    this.estimated_hours = estimated_hours;
    this.assignee = assignee;
  }

  // Resolve o primeiro campo válido de uma lista de chaves alternativas
  static resolveField(data, keys, fallback) {
    for (const key of keys) {
      if (data?.[key] !== undefined && data?.[key] !== null) {
        return data[key];
      }
    }
    return fallback;
  }

  // Constrói uma Task a partir de um objecto genérico (API, IA, etc.)
  static fromObject(data = {}) {
    if (!data || typeof data !== "object") {
      return null;
    }

    const title = Task.resolveField(data, ["title", "task"], "");
    const description = Task.resolveField(data, ["description", "body"], "");
    const types_id = Task.resolveField(data, ["types_id", "type_id", "typeId"], 1);
    const status_id = Task.resolveField(data, ["status_id", "statusId"], 1);
    const priority_id = Task.resolveField(data, ["priority_id", "priorityId"], 1);
    const category_id = Task.resolveField(data, ["category_id", "categoryId"], 1);
    const project_id = Task.resolveField(data, ["project_id", "projectId"], 1);
    const created_at = Task.resolveField(data, ["created_at", "createdAt"], new Date().toISOString());
    const due_date = Task.resolveField(data, ["due_date", "dueDate"], new Date().toISOString());
    const completed_at = Task.resolveField(data, ["completed_at", "completedAt"], null);
    const estimated_hours = Task.resolveField(data, ["estimated_hours", "estimatedHours"], 0);
    const assignee = Task.resolveField(data, ["assignee", "user", "owner"], "Não atribuído");

    return new Task({
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
      assignee,
    });
  }

  // Serializa a tarefa para envio ao backend
  toPayload() {
    return {
      title: this.title,
      description: this.description,
      types_id: this.types_id,
      status_id: this.status_id,
      priority_id: this.priority_id,
      category_id: this.category_id,
      project_id: this.project_id,
      created_at: this.created_at,
      due_date: this.due_date,
      completed_at: this.completed_at,
      estimated_hours: this.estimated_hours,
      assignee: this.assignee,
    };
  }
}

export default Task;
