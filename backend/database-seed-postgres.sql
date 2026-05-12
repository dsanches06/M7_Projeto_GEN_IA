-- ============================================================
-- Seed de dados para PostgreSQL / Neon + Vercel
-- ============================================================

-- 1. TABELAS DE REFERÊNCIA (Lookups)
INSERT INTO roles (id, name, flow_order) VALUES
  (1, 'ADMIN', 1), (2, 'USER', 2), (3, 'MODEL', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_status (id, name, flow_order) VALUES
  (1, 'CREATED', 1), (2, 'ASSIGNED', 2), (3, 'IN_PROGRESS', 3), 
  (4, 'BLOCKED', 4), (5, 'COMPLETED', 5), (6, 'ARCHIVED', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO priorities (id, name, flow_order) VALUES
  (1, 'Baixa', 1), (2, 'Média', 2), (3, 'Alta', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. UTILIZADORES (Ordem baralhada para testes de ordenação)
INSERT INTO users (id, name, email, phone, gender, role_id) VALUES
  (1,  'Hugo Neto',   'hugo@dev.com',   '555-0108', 'Masculino', 2),
  (2,  'Ana Silva',   'ana@dev.com',    '555-0101', 'Feminino', 2),
  (3,  'Joana Luz',   'joana@dev.com',  '555-0110', 'Feminino', 2),
  (4,  'Bruno Costa', 'bruno@dev.com',  '555-0102', 'Masculino', 2),
  (5,  'Igor Lima',   'igor@dev.com',   '555-0109', 'Masculino', 2),
  (6,  'Carla Dias',  'carla@dev.com',  '555-0103', 'Feminino', 2),
  (7,  'Filipe Gil',  'filipe@dev.com', '555-0106', 'Masculino', 2),
  (8,  'Elena Vaz',   'elena@dev.com',  '555-0105', 'Feminino', 2),
  (9,  'David Reas',  'david@dev.com',  '555-0104', 'Masculino', 2),
  (10, 'Gina Rosa',   'gina@dev.com',   '555-0107', 'Feminino', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. TAGS
INSERT INTO tags (id, name, color) VALUES
  (1, 'Urgente', 'Red'), (2, 'Backend', 'Green'), (3, 'Frontend', 'Blue'),
  (4, 'Bug', 'Orange'), (5, 'Revisão', 'Purple'), (6, 'Infra', 'Grey')
ON CONFLICT (id) DO NOTHING;

-- 4. TAREFAS (Exemplo seguindo o teu último CREATE TABLE)
INSERT INTO task (id, title, description, status_id, priority_id, estimated_hours, due_date) VALUES
  (1, 'Login UI', 'Ecrã login', 3, 3, 8.00, '2026-02-01'),
  (2, 'API Auth', 'JWT Auth', 3, 3, 12.00, '2026-02-01'),
  (3, 'DB Schema', 'Tabelas SQL', 3, 2, 6.00, '2026-01-20'),
  (4, 'GPS Maps', 'Integração GPS', 2, 3, 20.00, '2026-02-28')
ON CONFLICT (id) DO NOTHING;

-- 5. ATRIBUIÇÕES (1 Dev por Task)
INSERT INTO task_assignees (task_id, user_id) VALUES
  (1, 2), (2, 4), (3, 7), (4, 1)
ON CONFLICT (task_id) DO NOTHING;

-- 6. CONVERSAS (Ligadas a um Utilizador)
INSERT INTO conversations (id, user_id, title) VALUES
  (1, 1, 'Suporte Login'),
  (2, 2, 'Erro API Pagamentos'),
  (3, 4, 'Problema UI Dashboard')
ON CONFLICT (id) DO NOTHING;

-- 7. HISTÓRICO DE CHAT (User vs Model)
INSERT INTO chat_history (conversation_id, role_id, content) VALUES
  (1, 2, 'Não consigo fazer login'),
  (1, 3, 'Pode verificar se a senha está correta?'),
  (1, 2, 'Sim mas continua a falhar'),
  (2, 2, 'API de pagamentos está a dar erro 500'),
  (2, 3, 'Verifique os logs do servidor via SSH'),
  (3, 2, 'O dashboard não carrega'),
  (3, 3, 'Pode confirmar se há erro na consola (F12)?'),
  (3, 2, 'Sim, erro Failed to fetch no endpoint /stats'),
  (3, 3, 'Vou verificar o estado do serviço de métricas.'),
  (3, 2, 'Obrigado, fico a aguardar.');

-- 8. TICKETS
INSERT INTO tickets (user_id, user_report, error_type, severity, status) VALUES
  (1, 'Sistema crasha ao fazer login', 'API', 9, 'open'),
  (2, 'Base de dados não responde', 'Database', 10, 'open'),
  (4, 'Dashboard demora a carregar', 'UI', 7, 'in_progress')
ON CONFLICT DO NOTHING;

-- 9. ASSOCIAÇÃO TAGS TAREFAS
INSERT INTO tags_task (task_id, tag_id) VALUES
  (1, 1), (1, 3), (2, 2)
ON CONFLICT DO NOTHING;

-- 10. REAJUSTE DE SEQUÊNCIAS (CRÍTICO PARA NEON/POSTGRES)
SELECT setval(pg_get_serial_sequence('roles', 'id'), coalesce(max(id), 1), true) FROM roles;
SELECT setval(pg_get_serial_sequence('task_status', 'id'), coalesce(max(id), 1), true) FROM task_status;
SELECT setval(pg_get_serial_sequence('priorities', 'id'), coalesce(max(id), 1), true) FROM priorities;
-- Tabelas Principais
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1), true) FROM users;
SELECT setval(pg_get_serial_sequence('task', 'id'), coalesce(max(id), 1), true) FROM task;
SELECT setval(pg_get_serial_sequence('tags', 'id'), coalesce(max(id), 1), true) FROM tags;
-- Tabelas de Interação e Chat
SELECT setval(pg_get_serial_sequence('conversations', 'id'), coalesce(max(id), 1), true) FROM conversations;
SELECT setval(pg_get_serial_sequence('chat_history', 'id'), coalesce(max(id), 1), true) FROM chat_history;
SELECT setval(pg_get_serial_sequence('tickets', 'id'), coalesce(max(id), 1), true) FROM tickets;
SELECT setval(pg_get_serial_sequence('notification', 'id'), coalesce(max(id), 1), true) FROM notification;
