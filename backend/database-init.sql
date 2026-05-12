DROP DATABASE IF EXISTS clickup_db;
CREATE DATABASE clickup_db;
USE clickup_db;

/* 1. Tabela de Roles
   Define quem pode falar no sistema: 'user', 'model' (IA), 'admin'
*/
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    flow_order INT
);

/* 2. Utilizadores (Humanos) */
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    gender ENUM('Masculino', 'Feminino', 'Outro', 'Não informado') DEFAULT 'Não informado',
    role_id INT DEFAULT 1, -- Geralmente o ID do role 'user'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL
);

/* 3. Sessões de Chat 
   Cada sessão pertence a um utilizador humano.
*/
CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, 
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

/* 4. Histórico de Mensagens
   O role_id aqui define se a mensagem foi enviada pelo 'user' ou pelo 'model' (bot).
*/
CREATE TABLE chat_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    role_id INT NOT NULL, 
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);


/* 5. Tickets de Erro
   Vinculados ao utilizador que reportou o problema.
*/
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    user_report TEXT NOT NULL,
    error_type VARCHAR(50),            
    severity INT CHECK (severity BETWEEN 1 AND 10), 
    fix_suggestion TEXT,                
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

/* 7. Metadados de Tarefas */
CREATE TABLE task_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE priorities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

/* 8. Tarefas (Task) */
CREATE TABLE task (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status_id INT NOT NULL,
    priority_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    due_date DATETIME,
    completed_at DATETIME,
    estimated_hours DECIMAL(5, 2) NOT NULL,
    FOREIGN KEY (status_id) REFERENCES task_status (id),
    FOREIGN KEY (priority_id) REFERENCES priorities (id)
);

/* 9. Responsáveis pela Tarefa 
   Regra: 1 dev por tarefa (UNIQUE em task_id).
*/
CREATE TABLE task_assignees (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id),
    UNIQUE KEY uniq_task_assignment (task_id),
    FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

/* 10. Tags */
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20)
);

CREATE TABLE tags_task (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

/* 11. Notificações */
CREATE TABLE notification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- =====================================================
-- 2. INSERÇÃO DE DADOS SINCRONIZADOS
-- =================================================

/* 1. Roles (Importante: 2=USER, 3=MODEL conforme o teu histórico) */
INSERT INTO roles (id, name, flow_order) VALUES 
(1,'ADMIN',1), 
(2,'USER',2), 
(3,'MODEL',3);

/* 2. Users (10 utilizadores)  com ordem aleatória para testar ordenação (ASC/DESC) */
INSERT INTO users (id, name, email, phone, gender, role_id) VALUES
(1, 'Hugo Neto', 'hugo@dev.com', '555-0108', 'Masculino', 2),
(2, 'Ana Silva', 'ana@dev.com', '555-0101', 'Feminino', 2), 
(3, 'Joana Luz', 'joana@dev.com', '555-0110', 'Feminino', 2),
(4, 'Bruno Costa', 'bruno@dev.com', '555-0102', 'Masculino', 2),
(5, 'Igor Lima', 'igor@dev.com', '555-0109', 'Masculino', 2),
(6, 'Carla Dias', 'carla@dev.com', '555-0103', 'Feminino', 2),
(7, 'Filipe Gil', 'filipe@dev.com', '555-0106', 'Masculino', 2),
(8, 'Elena Vaz', 'elena@dev.com', '555-0105', 'Feminino', 2), 
(9, 'David Reas', 'david@dev.com', '555-0104', 'Masculino', 2),
(10, 'Gina Rosa', 'gina@dev.com', '555-0107', 'Feminino', 2);

/* 3. Metadados de Tarefas */
INSERT INTO task_status (id, name, flow_order) VALUES
(1,'CREATED',1), (2,'ASSIGNED',2), (3,'IN_PROGRESS',3), (4,'BLOCKED',4), (5,'COMPLETED',5), (6,'ARCHIVED',6);
INSERT INTO priorities (id, name, flow_order) VALUES 
(1,'Baixa',1), (2,'Média',2), (3,'Alta',3);

/* 4. Tarefas (Apenas as mais importantes para teste) */
INSERT INTO task (id, title, description, status_id, priority_id, estimated_hours, due_date) VALUES
(1,'Login UI','Ecrã login',3,3,8,'2026-02-01'),
(2,'API Auth','JWT Auth',3,3,12,'2026-02-01'),
(3,'DB Schema','Tabelas SQL',3,2,6,'2026-01-20'),
(4,'GPS Maps','Integração',2,3,20,'2026-02-28');

/* 6. Atribuições (1 Dev por Task) */
INSERT INTO task_assignees (task_id, user_id) VALUES
(1,1), (2,4), (3,7), (4,2);


/* 7. Tickets (Vinculados a quem reportou) */
INSERT INTO tickets (user_id, user_report, error_type, severity, status) VALUES
(1, 'Sistema crasha ao fazer login', 'API', 9, 'open'),
(2, 'Base de dados não responde', 'Database', 10, 'open'),
(4, 'Dashboard demora a carregar', 'UI', 7, 'in_progress');

/* 8. Tags */
INSERT INTO tags (id, name, color) VALUES
(1, 'Urgente', 'Red'), (2, 'Backend', 'Green'), (3, 'Frontend', 'Blue'),
(4, 'Bug', 'Orange'), (5, 'Revisão', 'Purple'), (6, 'Infra', 'Grey');

INSERT INTO tags_task (task_id, tag_id) VALUES 
(1, 1), (1, 3), (2, 2);

