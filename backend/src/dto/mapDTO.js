/* Função para mapear resposta de usuário */
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

/* Função para mapear resposta de status de tarefa */
export function mapTaskStatusDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    flow_order: data.flow_order,
  };
}

/* Função para mapear resposta de prioridade */
export function mapPriorityDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    flow_order: data.flow_order,
  };
}

/* Função para mapear resposta de tarefa */
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

/* Função para mapear resposta de comentário */
export function mapTaskAssigneeDTOResponse(data) {
  return {
    task_id: data.task_id,
    user_id: data.user_id,
    assigned_at: data.assigned_at,
  };
}

/* Função para mapear resposta de comentário */
export function mapTagDTOResponse(data) {
  return {
    id: data.id,
    name: data.name,
    color: data.color,
  };
}

/* Função para mapear resposta de comentário */
export function mapTagTaskDTOResponse(data) {
  return {
    task_id: data.task_id,
    tag_id: data.tag_id,
  };
}

/* Função para mapear resposta de comentário */
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

/* Função para mapear resposta de estatísticas de tarefa */
export function mapTaskStatsDTOResponse(data) {
  return {
    totalTasks: data.totalTasks,
    completedTasks: data.completedTasks,
    pendingTasks: data.pendingTasks,
    completedPercentage: data.completedPercentage,
  };
}
/* Função para mapear resposta de estatísticas de usuário */
export function mapUserStatsDTOResponse(data) {
  return {
    totalUsers: data.totalUsers,
    activeUsers: data.activeUsers,
    inactiveUsers: data.inactiveUsers,
    activePercentage: data.activePercentage + "%",
  };
}

/* Função para mapear resposta de estatísticas de projetos */
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

/* Função para mapear resposta de estatísticas de sprints */
export function mapSprintStatsDTOResponse(data) {
  return {
    totalSprints: data.totalSprints,
  };
}

/* Função para mapear resposta de estatísticas de teams */
export function mapTeamStatsDTOResponse(data) {
  return {
    totalTeams: data.totalTeams,
  };
}

// Função para mapear resposta de histórico de chat
export function mapChatHistoryDTOResponse(data) {
  return {
    id: data.id,
    conversation_id: data.conversation_id,
    role_id: data.role_id,
    content: data.content,
    sent_at: data.sent_at,
  };
}

// Função para mapear resposta de histórico de conversa
export function mapConversationDTOResponse(data) {
  return {
    id: data.id,
    title: data.title,
    created_at: data.created_at,
  };
}

// Função para mapear resposta de tiquete
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
