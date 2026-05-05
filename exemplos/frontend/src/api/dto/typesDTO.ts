import { UserRole } from "../../security/UserRole.js";

/* Interface para representar utilizador vindo da API */
export interface UserDTORequest {
  id: number;
  name: string;
  email: string;
  phone: number;
  gender: string;
  active: number;
  created_at: string;
}

/* Interface para representar estatísticas de utilizador vindo da API */
export interface UserStatsDTORequest {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  activePercentage: string;
  inactivePercentage: string;
}

/* Interface para representar notificação vindo da API */
export interface NotificationDTORequest {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: number;
  sent_at: string;
}

/* Interface para representar tarefa vindo da API */
export interface TaskDTORequest {
  id: number;
  title: string;
  description?: string;
  types_id?: number;
  status_id?: number;
  priority_id?: number;
  category_id?: number;
  assigned_to?: number;
  project_id: number;
  due_date?: string;
  completed_at?: string;
  created_at?: string;
  estimated_hours?: number;
}

/* Interface para representar estatísticas de tarefas vindo da API */
export interface TaskStatsDTORequest {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completedPercentage: string;
}

/** Interface para representar comentário de tarefa vindo da API */
export interface TaskCommentDTORequest {
  id: number;
  content: string;
  task_id: number;
  userId: number;
  created_at: string;
  edited_at?: string;
  resolved?: number;
}

/** Interface para representar tag vindo da API */
export interface TagDTORequest {
  id: number;
  name: string;
  color?: string;
}

/** Interface para representar projeto vindo da API */
export interface ProjectDTORequest {
  id: number;
  name: string;
  description?: string;
  project_status_id?: number;
  start_date?: string;
  end_date_expected?: string;
}

/** Interface para representar status de projeto vindo da API */
export interface ProjectStatusDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/** Interface para representar permissão de projeto vindo da API */
export interface ProjectPermissionDTORequest {
  id: number;
  project_id: number;
  user_id: number;
  permission: string;
  created_at: string;
}

/** Interface para representar equipe vindo da API */
export interface TeamDTORequest {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

/** Interface para representar tipo de tarefa vindo da API */
export interface TeamMemberRolesDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/** Interface para representar membro de equipe vindo da API */
export interface TeamMemberDTORequest {
  team_id: number;
  user_id: number;
  role_id: number;
  joined_at?: string;
}

/** Interface para representar sprint vindo da API */
export interface SprintDTORequest {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status_id?: number;
  start_date?: string;
  end_date?: string;
}

/** Interface para representar tarefa de sprint vindo da API */
export interface SprintTaskDTORequest {
  sprint_id: number;
  task_id: number;
}

/** Interface para representar prioridade vindo da API */
export interface PriorityDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/** Interface para representar status de tarefa vindo da API */
export interface TaskStatusDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/** Interface para representar tipo de tarefa vindo da API */
export interface TaskTypeDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/** Interface para representar histórico de status vindo da API */
export interface TaskStatusHistoryDTORequest {
  id: number;
  task_id: number;
  status_id: number;
  changed_at: string;
  changed_by?: number;
}

/** Interface para representar anexo de tarefa vindo da API */
export interface TaskAttachmentDTORequest {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

/** Interface para representar dependência de tarefa vindo da API */
export interface TaskDependencyDTORequest {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  created_at: string;
}

/** Interface para representar votação de tarefa vindo da API */
export interface TaskVoteDTORequest {
  id: number;
  task_id: number;
  user_id: number;
  vote_type: string;
  created_at: string;
}

/** Interface para representar menção vindo da API */
export interface MentionDTORequest {
  id: number;
  comment_id: number;
  mentioned_user_id: number;
}

/** Interface para representar lembrete vindo da API */
export interface ReminderDTORequest {
  id: number;
  task_id: number;
  user_id: number;
  remind_at: string;
  created_at: string;
}

/** Interface para representar log de tempo vindo da API */
export interface TimeLogDTORequest {
  id: number;
  task_id: number;
  user_id: number;
  hours: number;
  description?: string;
  logged_at: string;
}

/** Interface para representar tarefa e tag vindo da API */
export interface TagTaskDTORequest {
  task_id: number;
  tag_id: number;
}

/** Interface para representar tarefa favorita vindo da API */
export interface FavoriteTaskDTORequest {
  user_id: number;
  task_id: number;
  marked_at: string;
}

/** Interface para representar atribuição de tarefa vindo da API */
export interface TaskAssigneeDTORequest {
  task_id: number;
  user_id: number;
  assigned_at?: string;
}

/** Interface para representar categoria vindo da API */
export interface CategoryDTORequest {
  id: number;
  name: string;
  flow_order: number;
}

/* Interface para representar ranking de horas mais reais vindo da API */
export interface RankingMoreHoursDTORequest {
  projeto: string;
  utilizador: string;
  total_horas_reais: number;
  ranking: number;
}

/* Interface para representar ranking de horas de aumento vindo da API */
export interface RankingIncreaseHoursDTORequest {
  utilizador: string;
  data_dia: string;
  horas_dia: number;
  horas_dia_anterior: number;
  ranking_do_dia: number;
}

/* Interface para representar ranking de horas acima da média vindo da API */
export interface RankingAboveAverageDTORequest {
  projeto: string;
  total_horas_projeto: number;
  media_geral_sistema: number;
}

/* Interface para representar estatísticas de teams vindo da API */
export interface TeamStatsDTORequest {
  totalTeams: number;
}

/* Interface para representar estatísticas de sprints vindo da API */
export interface SprintStatsDTORequest {
  totalSprints: number;
}

/* Interface para representar estatísticas de projetos vindo da API */
export interface ProjectStatsDTORequest {
  totalProjects: number;
  activeProjects: number;
  finishedProjects: number;
  inDevelopmentProjects: number;
  activePercentage: string;
  finishedPercentage: string;
}
