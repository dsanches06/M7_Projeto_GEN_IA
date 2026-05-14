/**
 * Mapeia campos de entrada normalizando entre snake_case e camelCase
 * Útil para aceitar ambos os padrões de nomeação de API/frontend
 *
 * @param {Object} data - Objeto com dados brutos
 * @param {Object} fieldMap - Mapeamento { snake_case: 'camelCase' }
 * @returns {Object} Objeto normalizado com snake_case, usando camelCase como fallback
 *
 * @example
 * const mapped = normalizeFields(req.body, {
 *   user_id: 'userId',
 *   is_read: 'isRead',
 *   sent_at: 'sentAt'
 * });
 * // Se req.body = { userId: 1, isRead: true }
 * // Retorna { user_id: 1, is_read: true, sent_at: undefined }
 */
export function normalizeFields(data = {}, fieldMap = {}) {
  const result = {};

  for (const [snakeCaseKey, camelCaseKey] of Object.entries(fieldMap)) {
    // Prioriza snake_case, fallback para camelCase
    result[snakeCaseKey] = data[snakeCaseKey] ?? data[camelCaseKey] ?? undefined;
  }

  return result;
}

/**
 * Mapeia campos opcionais de notificação
 */
export const NOTIFICATION_FIELD_MAP = {
  user_id: 'userId',
  title: 'title',
  message: 'message',
  is_read: 'isRead',
  sent_at: 'sentAt',
};

/**
 * Mapeia campos opcionais de tarefa
 */
export const TASK_FIELD_MAP = {
  title: 'title',
  description: 'description',
  status_id: 'statusId',
  priority_id: 'priorityId',
  created_at: 'createdAt',
  due_date: 'dueDate',
  completed_at: 'completedAt',
  estimated_hours: 'estimatedHours',
  user_id: 'userId',
};

/**
 * Mapeia campos de tag
 */
export const TAG_FIELD_MAP = {
  task_id: 'taskId',
  tag_id: 'tagId',
};

/**
 * Mapeia campos de ticket
 */
export const TICKET_FIELD_MAP = {
  ticket_id: 'ticketId',
  user_id: 'userId',
  user_report: 'userReport',
  error_type: 'errorType',
  severity: 'severity',
  fix_suggestion: 'fixSuggestion',
  created_at: 'createdAt',
  status: 'ticketStatus',
};

/**
 * Atalho para normalizar notificações
 */
export function normalizeNotificationFields(data) {
  return normalizeFields(data, NOTIFICATION_FIELD_MAP);
}

/**
 * Atalho para normalizar tarefas
 */
export function normalizeTaskFields(data) {
  return normalizeFields(data, TASK_FIELD_MAP);
}

/**
 * Atalho para normalizar tags
 */
export function normalizeTagFields(data) {
  return normalizeFields(data, TAG_FIELD_MAP);
}

/**
 * Atalho para normalizar tickets
 */
export function normalizeTicketFields(data) {
  return normalizeFields(data, TICKET_FIELD_MAP);
}
