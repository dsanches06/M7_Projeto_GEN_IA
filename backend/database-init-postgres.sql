-- PostgreSQL schema for Neon / Vercel
-- Execute this inside your target Neon database.
-- This script creates tables if they don't exist, preserving existing data.

-- Tabelas sem dependências primeiro
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS project_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS task_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

CREATE TABLE IF NOT EXISTS team_members_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    flow_order INT
);

-- Tabelas com dependências
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    gender VARCHAR(20) NOT NULL,
    role_id INT DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    project_status_id INT,
    start_date TIMESTAMP,
    end_date_expected TIMESTAMP,
    CONSTRAINT fk_project_status FOREIGN KEY (project_status_id) REFERENCES project_status (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    role_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_history_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_history_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_report TEXT NOT NULL,
    error_type VARCHAR(20),
    severity INT CHECK (severity BETWEEN 1 AND 10),
    fix_suggestion TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    types_id INT NOT NULL,
    status_id INT NOT NULL,
    priority_id INT NOT NULL,
    category_id INT NOT NULL,
    project_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_hours NUMERIC(5,2) NOT NULL,
    CONSTRAINT fk_task_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_status FOREIGN KEY (status_id) REFERENCES task_status (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_priority FOREIGN KEY (priority_id) REFERENCES priorities (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_types FOREIGN KEY (types_id) REFERENCES task_types (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_assignees (
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id),
    UNIQUE (task_id),
    CONSTRAINT fk_task_assignees_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_assignees_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS tags_task (
    task_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (task_id, tag_id),
    CONSTRAINT fk_tags_task_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_tags_task_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite_task (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (task_id, user_id),
    CONSTRAINT fk_favorite_task_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_task_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_comment_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentions (
    id SERIAL PRIMARY KEY,
    comment_id INT,
    mentioned_user_id INT,
    CONSTRAINT fk_mentions_comment FOREIGN KEY (comment_id) REFERENCES comment (id) ON DELETE CASCADE,
    CONSTRAINT fk_mentions_user FOREIGN KEY (mentioned_user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_team_members_role FOREIGN KEY (role_id) REFERENCES team_members_roles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    task_id INT,
    user_id INT,
    hours NUMERIC(5,2) NOT NULL,
    description TEXT NOT NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_time_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_time_logs_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reminder (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT,
    remind_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reminder_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_permission (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    permission VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_permission_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    CONSTRAINT fk_project_permission_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_vote (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_vote_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_vote_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_dependency (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    depends_on_task_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_dependency_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_dependency_depends FOREIGN KEY (depends_on_task_id) REFERENCES task (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_attachment (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_attachment_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS task_status_history (
    id SERIAL PRIMARY KEY,
    task_id INT NOT NULL,
    status_id INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INT,
    CONSTRAINT fk_task_status_history_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_status_history_status FOREIGN KEY (status_id) REFERENCES task_status (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_status_history_user FOREIGN KEY (changed_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sprints (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(100),
    description TEXT,
    status_id INT NOT NULL,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    CONSTRAINT fk_sprints_project FOREIGN KEY (project_id) REFERENCES project (id) ON DELETE CASCADE,
    CONSTRAINT fk_sprints_status FOREIGN KEY (status_id) REFERENCES project_status (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sprint_tasks (
    sprint_id INT,
    task_id INT,
    PRIMARY KEY (sprint_id, task_id),
    CONSTRAINT fk_sprint_tasks_sprint FOREIGN KEY (sprint_id) REFERENCES sprints (id) ON DELETE CASCADE,
    CONSTRAINT fk_sprint_tasks_task FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    original_text VARCHAR(300) NOT NULL,
    summary VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_summaries_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);