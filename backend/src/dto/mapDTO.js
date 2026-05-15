// Mapeia o registo de utilizador para o formato de resposta da API
export function mapUserDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    active: data.active,
    created_at: data.created_at,
  };
}

// Mapeia o estado de tarefa para o formato de resposta da API
export function mapTaskStatusDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    flow_order: data.flow_order,
  };
}

// Mapeia a prioridade para o formato de resposta da API
export function mapPriorityDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    flow_order: data.flow_order,
  };
}

// Mapeia a tarefa para o formato de resposta da API
export function mapTaskDTOResponse(data) {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status_id: data.status_id,
    priority_id: data.priority_id,
    created_at: data.created_at,
    due_date: data.due_date,
    completed_at: data.completed_at,
    estimated_hours: data.estimated_hours,
    assigned_to: data.assigned_to,
  };
}

// Mapeia a atribuição de tarefa a utilizador para o formato de resposta da API
export function mapTaskAssigneeDTOResponse(data) {
  return {
    task_id: data.task_id,
    user_id: data.user_id,
    assigned_at: data.assigned_at,
  };
}

// Mapeia a etiqueta para o formato de resposta da API
export function mapTagDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    color: data.color,
  };
}

// Mapeia a associação tarefa-etiqueta para o formato de resposta da API
export function mapTagTaskDTOResponse(data) {
  return {
    task_id: data.task_id,
    tag_id: data.tag_id,
  };
}

// Mapeia a notificação para o formato de resposta da API
export function mapNotificationDTOResponse(data) {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    message: data.message,
    is_read: data.is_read,
    sent_at: data.sent_at,
  };
}

// Mapeia as estatísticas de tarefas para o formato de resposta da API
export function mapTaskStatsDTOResponse(data) {
  return {
    totalTasks: data.totalTasks,
    completedTasks: data.completedTasks,
    pendingTasks: data.pendingTasks,
    completedPercentage: data.completedPercentage,
  };
}

// Mapeia as estatísticas de utilizadores para o formato de resposta da API
export function mapUserStatsDTOResponse(data) {
  return {
    totalUsers: data.totalUsers,
    activeUsers: data.activeUsers,
    inactiveUsers: data.inactiveUsers,
    activePercentage: data.activePercentage + "%", // Sufixo de percentagem adicionado aqui
  };
}

// Mapeia as estatísticas de projectos para o formato de resposta da API
export function mapProjectStatsDTOResponse(data) {
  return {
    totalProjects: data.totalProjects,
    activeProjects: data.activeProjects,
    finishedProjects: data.finishedProjects,
    inDevelopmentProjects: data.inDevelopmentProjects,
    activePercentage: data.activePercentage,
    finishedPercentage: data.finishedPercentage,
  };
}

// Mapeia as estatísticas de sprints para o formato de resposta da API
export function mapSprintStatsDTOResponse(data) {
  return {
    totalSprints: data.totalSprints,
  };
}

// Mapeia as estatísticas de equipas para o formato de resposta da API
export function mapTeamStatsDTOResponse(data) {
  return {
    totalTeams: data.totalTeams,
  };
}

// Mapeia a mensagem de histórico de chat para o formato de resposta da API
export function mapChatHistoryDTOResponse(data) {
  return {
    id: data.id,
    conversation_id: data.conversation_id,
    role_id: data.role_id,
    content: data.content,
    sent_at: data.sent_at,
  };
}

// Mapeia a conversa para o formato de resposta da API
export function mapConversationDTOResponse(data) {
  return {
    id: data.id,
    title: data.title,
    created_at: data.created_at,
  };
}

// Mapeia o tíquete de suporte para o formato de resposta da API
export function mapTicketDTOResponse(data) {
  return {
    id: data.id,
    user_report: data.user_report,
    error_type: data.error_type,
    severity: data.severity,
    fix_suggestion: data.fix_suggestion,
    status: data.status,
    created_at: data.created_at,
  };
}
