-- Seed de dados padrão para PostgreSQL / Neon
-- Execute este arquivo após criar o schema com database-init-postgres.sql.

INSERT INTO roles (id, name, flow_order) VALUES
  (1,'ADMIN',1),
  (2,'USER',2),
  (3,'MODEL',3);

INSERT INTO users (id, name, email, phone, gender) VALUES
  (1, 'Ana Silva', 'ana@dev.com', '555-0101', 'Female'),
  (2, 'Bruno Costa', 'bruno@dev.com', '555-0102', 'Male'),
  (3, 'Carla Dias', 'carla@dev.com', '555-0103', 'Female'),
  (4, 'David Reas', 'david@dev.com', '555-0104', 'Male'),
  (5, 'Elena Vaz', 'elena@dev.com', '555-0105', 'Female'),
  (6, 'Filipe Gil', 'filipe@dev.com', '555-0106', 'Male'),
  (7, 'Gina Rosa', 'gina@dev.com', '555-0107', 'Female'),
  (8, 'Hugo Neto', 'hugo@dev.com', '555-0108', 'Male'),
  (9, 'Igor Lima', 'igor@dev.com', '555-0109', 'Male'),
  (10, 'Joana Luz', 'joana@dev.com', '555-0110', 'Female');

INSERT INTO project_status (id, name, flow_order) VALUES
  (1, 'Ativo', 1),
  (2, 'Em Desenvolvimento', 2),
  (3, 'Concluido', 3);

INSERT INTO task_status (id, name, flow_order) VALUES
  (1,'CREATED',1),
  (2,'ASSIGNED',2),
  (3,'IN_PROGRESS',3),
  (4,'BLOCKED',4),
  (5,'COMPLETED',5),
  (6,'ARCHIVED',6);

INSERT INTO task_types (id, name, flow_order) VALUES
  (1,'Feature',1),
  (2,'Bug',2),
  (3,'Task',3);

INSERT INTO priorities (id, name, flow_order) VALUES
  (1,'Baixa',1),
  (2,'Média',2),
  (3,'Alta',3);

INSERT INTO categories (id, name, flow_order) VALUES
  (1,'WORKED',1),
  (2,'PERSONAL',2),
  (3,'STUDY',3);

INSERT INTO project (id, name, description, project_status_id, start_date) VALUES
  (1, 'Portal E-learning', 'Escola online', 1, '2026-01-01'),
  (2, 'App Logística', 'Frotas e GPS', 1, '2026-01-15'),
  (3, 'Data Lake Cloud', 'Infraestrutura AWS', 1, '2026-02-01');

INSERT INTO tags (id, name, color) VALUES
  (1, 'Urgente', 'Red'),
  (2, 'Backend', 'Green'),
  (3, 'Frontend', 'Blue'),
  (4, 'Bug', 'Orange'),
  (5, 'Revisão', 'Purple'),
  (6, 'Infra', 'Grey');


-- Ajusta as sequências para valores máximos das IDs inseridas
SELECT setval(pg_get_serial_sequence('roles','id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1), true);
SELECT setval(pg_get_serial_sequence('project_status','id'), COALESCE((SELECT MAX(id) FROM project_status), 1), true);
SELECT setval(pg_get_serial_sequence('task_status','id'), COALESCE((SELECT MAX(id) FROM task_status), 1), true);
SELECT setval(pg_get_serial_sequence('task_types','id'), COALESCE((SELECT MAX(id) FROM task_types), 1), true);
SELECT setval(pg_get_serial_sequence('priorities','id'), COALESCE((SELECT MAX(id) FROM priorities), 1), true);
SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories), 1), true);
SELECT setval(pg_get_serial_sequence('project','id'), COALESCE((SELECT MAX(id) FROM project), 1), true);
SELECT setval(pg_get_serial_sequence('tags','id'), COALESCE((SELECT MAX(id) FROM tags), 1), true);
SELECT setval(pg_get_serial_sequence('task','id'), COALESCE((SELECT MAX(id) FROM task), 1), true);
SELECT setval(pg_get_serial_sequence('favorite_task','id'), COALESCE((SELECT MAX(id) FROM favorite_task), 1), true);
SELECT setval(pg_get_serial_sequence('comment','id'), COALESCE((SELECT MAX(id) FROM comment), 1), true);
SELECT setval(pg_get_serial_sequence('mentions','id'), COALESCE((SELECT MAX(id) FROM mentions), 1), true);
SELECT setval(pg_get_serial_sequence('notification','id'), COALESCE((SELECT MAX(id) FROM notification), 1), true);
SELECT setval(pg_get_serial_sequence('teams','id'), COALESCE((SELECT MAX(id) FROM teams), 1), true);
SELECT setval(pg_get_serial_sequence('team_members_roles','id'), COALESCE((SELECT MAX(id) FROM team_members_roles), 1), true);
SELECT setval(pg_get_serial_sequence('time_logs','id'), COALESCE((SELECT MAX(id) FROM time_logs), 1), true);
SELECT setval(pg_get_serial_sequence('reminder','id'), COALESCE((SELECT MAX(id) FROM reminder), 1), true);
SELECT setval(pg_get_serial_sequence('project_permission','id'), COALESCE((SELECT MAX(id) FROM project_permission), 1), true);
SELECT setval(pg_get_serial_sequence('task_vote','id'), COALESCE((SELECT MAX(id) FROM task_vote), 1), true);
SELECT setval(pg_get_serial_sequence('task_dependency','id'), COALESCE((SELECT MAX(id) FROM task_dependency), 1), true);
SELECT setval(pg_get_serial_sequence('task_attachment','id'), COALESCE((SELECT MAX(id) FROM task_attachment), 1), true);
SELECT setval(pg_get_serial_sequence('task_status_history','id'), COALESCE((SELECT MAX(id) FROM task_status_history), 1), true);
SELECT setval(pg_get_serial_sequence('sprints','id'), COALESCE((SELECT MAX(id) FROM sprints), 1), true);
SELECT setval(pg_get_serial_sequence('chat_history','id'), COALESCE((SELECT MAX(id) FROM chat_history), 1), true);
SELECT setval(pg_get_serial_sequence('conversations','id'), COALESCE((SELECT MAX(id) FROM conversations), 1), true);
SELECT setval(pg_get_serial_sequence('summaries','id'), COALESCE((SELECT MAX(id) FROM summaries), 1), true);
SELECT setval(pg_get_serial_sequence('tickets','id'), COALESCE((SELECT MAX(id) FROM tickets), 1), true);
