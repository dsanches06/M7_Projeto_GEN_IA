import { normalizeFields, normalizeNotificationFields, normalizeTaskFields, normalizeTagFields, normalizeTicketFields } from './src/utils/fieldMapper.js';

console.log('=== TESTE DE FIELD MAPPER ===\n');

// ============ NOTIFICATION TESTS ============
console.log('📧 NOTIFICATION TESTS:');

const notificationCamelCase = {
  userId: 42,
  title: 'Test Notification',
  message: 'This is a test',
  isRead: true,
  sentAt: '2026-05-14T10:00:00Z'
};

const notificationSnakeCase = {
  user_id: 42,
  title: 'Test Notification',
  message: 'This is a test',
  is_read: true,
  sent_at: '2026-05-14T10:00:00Z'
};

const notificationMixed = {
  userId: 42,
  title: 'Test Notification',
  message: 'This is a test',
  is_read: true
};

console.log('camelCase input:', normalizeNotificationFields(notificationCamelCase));
console.log('snake_case input:', normalizeNotificationFields(notificationSnakeCase));
console.log('mixed input (fallback):', normalizeNotificationFields(notificationMixed));

// ============ TASK TESTS ============
console.log('\n📋 TASK TESTS:');

const taskCamelCase = {
  title: 'New Task',
  description: 'Task description',
  statusId: 2,
  priorityId: 1,
  createdAt: '2026-05-14T10:00:00Z',
  dueDate: '2026-05-21T10:00:00Z',
  estimatedHours: 5,
  userId: 1
};

const taskSnakeCase = {
  title: 'New Task',
  description: 'Task description',
  status_id: 2,
  priority_id: 1,
  created_at: '2026-05-14T10:00:00Z',
  due_date: '2026-05-21T10:00:00Z',
  estimated_hours: 5,
  user_id: 1
};

const taskMixed = {
  title: 'New Task',
  description: 'Task description',
  statusId: 2,
  priority_id: 1,
  dueDate: '2026-05-21T10:00:00Z'
};

console.log('camelCase input:', normalizeTaskFields(taskCamelCase));
console.log('snake_case input:', normalizeTaskFields(taskSnakeCase));
console.log('mixed input (fallback):', normalizeTaskFields(taskMixed));

// ============ TAG TESTS ============
console.log('\n🏷️  TAG TESTS:');

const tagCamelCase = {
  taskId: 5,
  tagId: 3
};

const tagSnakeCase = {
  task_id: 5,
  tag_id: 3
};

const tagMixed = {
  taskId: 5,
  tag_id: 3
};

console.log('camelCase input:', normalizeTagFields(tagCamelCase));
console.log('snake_case input:', normalizeTagFields(tagSnakeCase));
console.log('mixed input (fallback):', normalizeTagFields(tagMixed));

// ============ TICKET TESTS ============
console.log('\n🎫 TICKET TESTS:');

const ticketCamelCase = {
  ticketId: 10,
  userId: 5,
  userReport: 'Button not clickable',
  errorType: 'UI',
  severity: 8,
  fixSuggestion: 'Check CSS z-index',
  createdAt: '2026-05-14T10:00:00Z',
  ticketStatus: 'open'
};

const ticketSnakeCase = {
  ticket_id: 10,
  user_id: 5,
  user_report: 'Button not clickable',
  error_type: 'UI',
  severity: 8,
  fix_suggestion: 'Check CSS z-index',
  created_at: '2026-05-14T10:00:00Z',
  status: 'open'
};

const ticketMixed = {
  ticketId: 10,
  user_id: 5,
  userReport: 'Button not clickable',
  error_type: 'UI',
  fix_suggestion: 'Check CSS z-index'
};

console.log('camelCase input:', normalizeTicketFields(ticketCamelCase));
console.log('snake_case input:', normalizeTicketFields(ticketSnakeCase));
console.log('mixed input (fallback):', normalizeTicketFields(ticketMixed));

// ============ EDGE CASES ============
console.log('\n⚠️  EDGE CASES:');

console.log('empty object:', normalizeNotificationFields({}));
console.log('null values:', normalizeNotificationFields({ userId: null, title: 'Test' }));
console.log('undefined values:', normalizeNotificationFields({ userId: undefined, title: 'Test' }));

console.log('\n✅ TODOS OS TESTES CONCLUÍDOS!');
