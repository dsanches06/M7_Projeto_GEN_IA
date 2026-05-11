-- ============================================================
-- Seed de dados para PostgreSQL / Neon + Vercel
-- Execute após database-init-postgres.sql
-- Gerado a partir de database-init.sql (MySQL source of truth)
-- ============================================================

-- ------------------------------------------------------------
-- Lookup / Reference tables
-- ------------------------------------------------------------

INSERT INTO roles (id, name, flow_order) VALUES
  (1, 'ADMIN', 1),
  (2, 'USER',  2),
  (3, 'MODEL', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO project_status (id, name, flow_order) VALUES
  (1, 'Ativo',            1),
  (2, 'Em Desenvolvimento',2),
  (3, 'Concluido',        3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_status (id, name, flow_order) VALUES
  (1, 'CREATED',    1),
  (2, 'ASSIGNED',   2),
  (3, 'IN_PROGRESS',3),
  (4, 'BLOCKED',    4),
  (5, 'COMPLETED',  5),
  (6, 'ARCHIVED',   6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_types (id, name, flow_order) VALUES
  (1, 'Feature', 1),
  (2, 'Bug',     2),
  (3, 'Task',    3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO priorities (id, name, flow_order) VALUES
  (1, 'Baixa', 1),
  (2, 'Média', 2),
  (3, 'Alta',  3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, flow_order) VALUES
  (1, 'WORKED',   1),
  (2, 'PERSONAL', 2),
  (3, 'STUDY',    3)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------

INSERT INTO users (id, name, email, phone, gender) VALUES
  (1,  'Ana Silva',   'ana@dev.com',    '555-0101', 'Female'),
  (2,  'Bruno Costa', 'bruno@dev.com',  '555-0102', 'Male'),
  (3,  'Carla Dias',  'carla@dev.com',  '555-0103', 'Female'),
  (4,  'David Reas',  'david@dev.com',  '555-0104', 'Male'),
  (5,  'Elena Vaz',   'elena@dev.com',  '555-0105', 'Female'),
  (6,  'Filipe Gil',  'filipe@dev.com', '555-0106', 'Male'),
  (7,  'Gina Rosa',   'gina@dev.com',   '555-0107', 'Female'),
  (8,  'Hugo Neto',   'hugo@dev.com',   '555-0108', 'Male'),
  (9,  'Igor Lima',   'igor@dev.com',   '555-0109', 'Male'),
  (10, 'Joana Luz',   'joana@dev.com',  '555-0110', 'Female')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Projects
-- ------------------------------------------------------------

INSERT INTO project (id, name, description, project_status_id, start_date) VALUES
  (1, 'Portal E-learning', 'Escola online',    1, '2026-01-01'),
  (2, 'App Logística',     'Frotas e GPS',     1, '2026-01-15'),
  (3, 'Data Lake Cloud',   'Infraestrutura AWS',1, '2026-02-01')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Tags
-- ------------------------------------------------------------

INSERT INTO tags (id, name, color) VALUES
  (1, 'Urgente', 'Red'),
  (2, 'Backend', 'Green'),
  (3, 'Frontend','Blue'),
  (4, 'Bug',     'Orange'),
  (5, 'Revisão', 'Purple'),
  (6, 'Infra',   'Grey')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Tasks (20)
-- ------------------------------------------------------------

INSERT INTO task (id, title, description, types_id, status_id, priority_id, category_id, project_id, estimated_hours, due_date) VALUES
  (1,  'Login UI',    'Ecrã login',      1, 3, 3, 1, 1,  8, '2026-02-01'),
  (2,  'API Auth',    'JWT Auth',        1, 3, 3, 2, 1, 12, '2026-02-01'),
  (3,  'Sidebar',     'Menu',            1, 2, 2, 1, 1,  5, '2026-02-15'),
  (4,  'DB Schema',   'Tabelas SQL',     1, 3, 2, 3, 1,  6, '2026-01-20'),
  (5,  'Bug Botão',   'Fix click',       2, 1, 1, 1, 1,  2, '2026-03-01'),
  (6,  'Profile Page','Dados user',      1, 1, 2, 1, 1, 10, '2026-03-05'),
  (7,  'Notificações','Push',            1, 1, 2, 2, 1, 15, '2026-03-10'),
  (8,  'GPS Maps',    'Integração',      1, 2, 3, 1, 2, 20, '2026-02-28'),
  (9,  'Driver API',  'Endpoints',       1, 3, 3, 2, 2, 10, '2026-02-10'),
  (10, 'Query Optm',  'Frotas',          1, 2, 2, 3, 2,  8, '2026-03-01'),
  (11, 'Icons Pack',  'Design',          1, 3, 1, 1, 2,  4, '2026-01-30'),
  (12, 'Fuel Log',    'Combustível',     1, 1, 2, 2, 2, 12, '2026-03-15'),
  (13, 'Reports',     'PDF mensal',      1, 1, 2, 2, 2, 10, '2026-03-20'),
  (14, 'Fix Crash',   'Boot fix',        3, 3, 3, 2, 2,  4, '2026-02-01'),
  (15, 'S3 Config',   'AWS Storage',     1, 3, 3, 3, 3, 10, '2026-02-10'),
  (16, 'ETL Job',     'Data sync',       1, 2, 3, 3, 3, 20, '2026-03-15'),
  (17, 'Backup DB',   'Crontab',         1, 3, 2, 3, 3,  5, '2026-02-15'),
  (18, 'Dashboard',   'Charts',          1, 1, 2, 1, 3, 15, '2026-04-01'),
  (19, 'IAM Roles',   'Permissões',      1, 2, 3, 3, 3,  6, '2026-03-20'),
  (20, 'Index Fix',   'Slow query',      2, 2, 3, 3, 3,  4, '2026-03-25')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Task Assignees
-- ------------------------------------------------------------

INSERT INTO task_assignees (task_id, user_id) VALUES
  (1,1),(2,4),(3,2),(4,7),(5,3),(6,1),(7,5),(8,1),
  (9,5),(10,8),(11,2),(12,4),(13,6),(14,5),(15,7),
  (16,8),(17,9),(18,2),(19,10),(20,8)
ON CONFLICT (task_id) DO NOTHING;

-- ------------------------------------------------------------
-- Tags <-> Tasks (N:M)
-- ------------------------------------------------------------

INSERT INTO tags_task (task_id, tag_id) VALUES
  (1,1),(1,3),   -- Login UI:    Urgente + Frontend
  (2,2),         -- API Auth:    Backend
  (3,3),         -- Sidebar:     Frontend
  (4,2),(4,6),   -- DB Schema:   Backend + Infra
  (5,4),(5,1),   -- Bug Botão:   Bug + Urgente
  (6,3),(6,1),   -- Profile Page:Frontend + Urgente
  (7,2),         -- Notificações:Backend
  (8,3),         -- GPS Maps:    Frontend
  (9,2),(9,5),   -- Driver API:  Backend + Revisão
  (10,4),        -- Query Optm:  Bug
  (11,6),        -- Icons Pack:  Infra
  (12,6),(12,5), -- Fuel Log:    Infra + Revisão
  (13,6),        -- Reports:     Infra
  (14,6),        -- Fix Crash:   Infra
  (15,2)         -- S3 Config:   Backend
ON CONFLICT (task_id, tag_id) DO NOTHING;

-- ------------------------------------------------------------
-- Notifications
-- ------------------------------------------------------------

INSERT INTO notification (user_id, title, message) VALUES
  (1, 'Menção', 'Foste mencionada pelo David na tarefa Login UI'),
  (7, 'Menção', 'Configuração S3 concluída');

-- ------------------------------------------------------------
-- Conversations (20)
-- ------------------------------------------------------------

INSERT INTO conversations (id, title, created_at) VALUES
  (1,  'Suporte Login',        NOW()),
  (2,  'Erro API Pagamentos',  NOW()),
  (3,  'Problema UI Dashboard',NOW()),
  (4,  'Bug Notificações',     NOW()),
  (5,  'Ajuda Integração',     NOW()),
  (6,  'Erro Base de Dados',   NOW()),
  (7,  'Lentidão Sistema',     NOW()),
  (8,  'Configuração Projeto', NOW()),
  (9,  'Erro Deploy',          NOW()),
  (10, 'Suporte Mobile',       NOW()),
  (11, 'Bug Filtros',          NOW()),
  (12, 'Problema Upload',      NOW()),
  (13, 'Erro Autenticação',    NOW()),
  (14, 'UI Quebrada',          NOW()),
  (15, 'Falha Email',          NOW()),
  (16, 'Erro Permissões',      NOW()),
  (17, 'Bug Relatórios',       NOW()),
  (18, 'Problema Cache',       NOW()),
  (19, 'Erro Integração API',  NOW()),
  (20, 'Suporte Geral',        NOW())
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------
-- Chat History (3 mensagens × 20 conversas = 60 linhas)
-- ------------------------------------------------------------

INSERT INTO chat_history (conversation_id, role_id, content, sent_at) VALUES
  (1,  2, 'Não consigo fazer login',             NOW()),
  (1,  3, 'Pode verificar se a senha está correta?', NOW()),
  (1,  2, 'Sim mas continua a falhar',            NOW()),

  (2,  2, 'API de pagamentos está a dar erro 500',NOW()),
  (2,  3, 'Verifique os logs do servidor',        NOW()),
  (2,  2, 'Já verifiquei, parece timeout',        NOW()),

  (3,  2, 'O dashboard não carrega',              NOW()),
  (3,  3, 'Pode limpar o cache?',                 NOW()),
  (3,  2, 'Já tentei, sem sucesso',               NOW()),

  (4,  2, 'Não recebo notificações',              NOW()),
  (4,  3, 'Verifique as configurações',           NOW()),
  (4,  2, 'Está tudo ativo',                      NOW()),

  (5,  2, 'Preciso integrar com API externa',     NOW()),
  (5,  3, 'Use token de autenticação',            NOW()),
  (5,  2, 'Onde configuro isso?',                 NOW()),

  (6,  2, 'Erro ao conectar à base de dados',     NOW()),
  (6,  3, 'Verifique a string de conexão',        NOW()),
  (6,  2, 'Está correta',                         NOW()),

  (7,  2, 'Sistema está lento',                   NOW()),
  (7,  3, 'Pode ser carga alta',                  NOW()),
  (7,  2, 'Sim muitos utilizadores',              NOW()),

  (8,  2, 'Como configuro projeto?',              NOW()),
  (8,  3, 'Aceda às settings',                    NOW()),
  (8,  2, 'Ok obrigado',                          NOW()),

  (9,  2, 'Erro no deploy',                       NOW()),
  (9,  3, 'Verifique logs CI/CD',                 NOW()),
  (9,  2, 'Erro de build',                        NOW()),

  (10, 2, 'App mobile crasha',                    NOW()),
  (10, 3, 'Qual dispositivo?',                    NOW()),
  (10, 2, 'Android',                              NOW()),

  (11, 2, 'Filtro não funciona',                  NOW()),
  (11, 3, 'Atualize página',                      NOW()),
  (11, 2, 'Sem efeito',                           NOW()),

  (12, 2, 'Upload falha',                         NOW()),
  (12, 3, 'Formato do ficheiro?',                 NOW()),
  (12, 2, 'PDF',                                  NOW()),

  (13, 2, 'Erro autenticação',                    NOW()),
  (13, 3, 'Token expirado?',                      NOW()),
  (13, 2, 'Sim',                                  NOW()),

  (14, 2, 'UI está quebrada',                     NOW()),
  (14, 3, 'Qual browser?',                        NOW()),
  (14, 2, 'Chrome',                               NOW()),

  (15, 2, 'Emails não chegam',                    NOW()),
  (15, 3, 'Verifique SMTP',                       NOW()),
  (15, 2, 'Está ok',                              NOW()),

  (16, 2, 'Sem permissões',                       NOW()),
  (16, 3, 'Role correta?',                        NOW()),
  (16, 2, 'Não',                                  NOW()),

  (17, 2, 'Relatórios falham',                    NOW()),
  (17, 3, 'Erro SQL?',                            NOW()),
  (17, 2, 'Sim',                                  NOW()),

  (18, 2, 'Cache não limpa',                      NOW()),
  (18, 3, 'Reinicie serviço',                     NOW()),
  (18, 2, 'Funcionou',                            NOW()),

  (19, 2, 'API externa falha',                    NOW()),
  (19, 3, 'Timeout?',                             NOW()),
  (19, 2, 'Sim',                                  NOW()),

  (20, 2, 'Preciso de ajuda geral',               NOW()),
  (20, 3, 'Como posso ajudar?',                   NOW()),
  (20, 2, 'Configuração inicial',                 NOW());

-- ------------------------------------------------------------
-- Tickets (10)
-- error_type: 'auth' | 'network' | 'ui' | 'data' | 'perf'
-- severity: 1 (baixa) → 10 (crítica)
-- status: 'open' | 'in_progress' | 'resolved' | 'closed'
-- ------------------------------------------------------------

INSERT INTO tickets (user_report, error_type, severity, fix_suggestion, status, created_at) VALUES
-- 🔴 CRITICAL (auto-escalados)
('Sistema crasha ao fazer login',       'API',      9,  'Rever autenticação e logs',          'open',        NOW()),
('Base de dados não responde',          'Database', 10, 'Verificar conexão e índices',        'open',        NOW()),
('API pagamentos retorna erro 500',     'API',      9,  'Implementar retries e logs',         'in_progress', NOW()),
('Perda de dados ao guardar',           'Database', 10, 'Corrigir transações',                'open',        NOW()),
('Aplicação crasha no mobile',          'UI',       8,  'Debug crash logs Android',           'in_progress', NOW()),
-- 🟠 HIGH
('Dashboard demora muito a carregar',   'API',      7,  'Otimizar queries',                   'in_progress', NOW()),
('Erro ao gerar relatórios',            'Database', 6,  'Rever SQL',                          'open',        NOW()),
('Upload de ficheiros falha',           'API',      7,  'Validar limites e tipos',            'closed',      NOW()),
('Filtros não funcionam corretamente',  'UI',       6,  'Corrigir lógica frontend',           'in_progress', NOW()),
('Notificações não chegam',             'API',      7,  'Rever sistema push',                 'open',        NOW()),
-- 🟡 NORMAL
('Layout desalinhado em alguns ecrãs',  'UI',       4,  'Ajustar CSS',                        'closed',      NOW()),
('Mensagem de erro pouco clara',        'UI',       3,  'Melhorar UX',                        'closed',      NOW()),
('Tempo de resposta ligeiramente alto', 'API',      5,  'Otimizar endpoints',                 'in_progress', NOW()),
('Cache não está a funcionar corretamente','API',   5,  'Configurar Redis',                   'open',        NOW()),
('Erro ao exportar dados',              'API',      5,  'Corrigir endpoint export',           'open',        NOW()),
-- 🟢 LOW
('Texto com erro ortográfico',          'UI',       1,  'Corrigir texto',                     'closed',      NOW()),
('Ícone desalinhado',                   'UI',       2,  'Ajustar CSS',                        'closed',      NOW()),
('Tooltip não aparece',                 'UI',       2,  'Corrigir JS',                        'closed',      NOW()),
('Cor incorreta em botão',              'UI',       1,  'Ajustar tema',                       'closed',      NOW()),
('Espaçamento inconsistente',           'UI',       2,  'Refinar layout',                     'closed',      NOW());

-- ------------------------------------------------------------
-- Ajuste de sequências (SERIAL) para valores máximos inseridos
-- ------------------------------------------------------------

SELECT setval(pg_get_serial_sequence('roles','id'),            COALESCE((SELECT MAX(id) FROM roles),1),            true);
SELECT setval(pg_get_serial_sequence('users','id'),            COALESCE((SELECT MAX(id) FROM users),1),            true);
SELECT setval(pg_get_serial_sequence('project_status','id'),   COALESCE((SELECT MAX(id) FROM project_status),1),   true);
SELECT setval(pg_get_serial_sequence('task_status','id'),      COALESCE((SELECT MAX(id) FROM task_status),1),      true);
SELECT setval(pg_get_serial_sequence('task_types','id'),       COALESCE((SELECT MAX(id) FROM task_types),1),       true);
SELECT setval(pg_get_serial_sequence('priorities','id'),       COALESCE((SELECT MAX(id) FROM priorities),1),       true);
SELECT setval(pg_get_serial_sequence('categories','id'),       COALESCE((SELECT MAX(id) FROM categories),1),       true);
SELECT setval(pg_get_serial_sequence('project','id'),          COALESCE((SELECT MAX(id) FROM project),1),          true);
SELECT setval(pg_get_serial_sequence('tags','id'),             COALESCE((SELECT MAX(id) FROM tags),1),             true);
SELECT setval(pg_get_serial_sequence('task','id'),             COALESCE((SELECT MAX(id) FROM task),1),             true);
SELECT setval(pg_get_serial_sequence('notification','id'),     COALESCE((SELECT MAX(id) FROM notification),1),     true);
SELECT setval(pg_get_serial_sequence('conversations','id'),    COALESCE((SELECT MAX(id) FROM conversations),1),    true);
SELECT setval(pg_get_serial_sequence('chat_history','id'),     COALESCE((SELECT MAX(id) FROM chat_history),1),     true);
SELECT setval(pg_get_serial_sequence('favorite_task','id'),    COALESCE((SELECT MAX(id) FROM favorite_task),1),    true);
SELECT setval(pg_get_serial_sequence('comment','id'),          COALESCE((SELECT MAX(id) FROM comment),1),          true);
SELECT setval(pg_get_serial_sequence('mentions','id'),         COALESCE((SELECT MAX(id) FROM mentions),1),         true);
SELECT setval(pg_get_serial_sequence('teams','id'),            COALESCE((SELECT MAX(id) FROM teams),1),            true);
SELECT setval(pg_get_serial_sequence('team_members_roles','id'),COALESCE((SELECT MAX(id) FROM team_members_roles),1),true);
SELECT setval(pg_get_serial_sequence('time_logs','id'),        COALESCE((SELECT MAX(id) FROM time_logs),1),        true);
SELECT setval(pg_get_serial_sequence('reminder','id'),         COALESCE((SELECT MAX(id) FROM reminder),1),         true);
SELECT setval(pg_get_serial_sequence('project_permission','id'),COALESCE((SELECT MAX(id) FROM project_permission),1),true);
SELECT setval(pg_get_serial_sequence('task_vote','id'),        COALESCE((SELECT MAX(id) FROM task_vote),1),        true);
SELECT setval(pg_get_serial_sequence('task_dependency','id'),  COALESCE((SELECT MAX(id) FROM task_dependency),1),  true);
SELECT setval(pg_get_serial_sequence('task_attachment','id'),  COALESCE((SELECT MAX(id) FROM task_attachment),1),  true);
SELECT setval(pg_get_serial_sequence('task_status_history','id'),COALESCE((SELECT MAX(id) FROM task_status_history),1),true);
SELECT setval(pg_get_serial_sequence('sprints','id'),          COALESCE((SELECT MAX(id) FROM sprints),1),          true);
SELECT setval(pg_get_serial_sequence('summaries','id'),        COALESCE((SELECT MAX(id) FROM summaries),1),        true);
SELECT setval(pg_get_serial_sequence('tickets','id'),          COALESCE((SELECT MAX(id) FROM tickets),1),          true);