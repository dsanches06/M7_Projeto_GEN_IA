var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, patch, remove, request } from "./index.js";
const ENDPOINT = "tasks";
/* ======================== GET ======================== */
/* Função para obter a lista de tarefas */
export function getTasks(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter tarefas de um projeto específico */
export function getTasksByProject(projectId, sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/project/${projectId}`, sort, search);
    });
}
/* Função para obter uma tarefa por ID */
export function getTaskById(taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, taskId);
    });
}
/* Função para obter estatísticas de tarefas */
export function getTaskStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(`${ENDPOINT}/stats`);
        return stats ? stats[0] || null : null;
    });
}
/* Função para obter tags de uma tarefa */
export function getTaskTags(taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield request(`${ENDPOINT}/${taskId}/tags`);
        return data !== null && data !== void 0 ? data : [];
    });
}
/* Função para obter comentários de uma tarefa */
export function getTaskComments(taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield request(`${ENDPOINT}/${taskId}/comments`);
        return data !== null && data !== void 0 ? data : [];
    });
}
/* Função para criar uma nova tarefa */
export function createTask(taskData) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, taskData);
    });
}
/* Função para adicionar uma tag a uma tarefa */
export function addTagToTask(taskId, tagData) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${taskId}/tags`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tagData),
        });
    });
}
/* Função para criar um comentário em uma tarefa */
export function createTaskComment(taskId, commentData) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${taskId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(commentData),
        });
    });
}
/* Função para atualizar uma tarefa */
export function updateTask(taskId, taskData) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, taskId, taskData);
    });
}
/* Função para atualizar parcialmente uma tarefa (datas, descrição, etc) */
export function partialUpdateTask(taskId, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield patch(ENDPOINT, taskId, updates);
        return result !== null;
    });
}
/* Função para atualizar um comentário */
export function updateTaskComment(taskId, commentId, commentData) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(commentData),
        });
    });
}
/* Função para atualizar o status de uma tarefa */
export function changeTaskStatus(taskId, statusId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${taskId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ task_status_id: statusId }),
        });
    });
}
/* Função para resolver um comentário */
export function resolveTaskComment(taskId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        });
    });
}
/* Função para deletar uma tarefa */
export function deleteTask(taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, taskId);
    });
}
/* Função para remover uma tag de uma tarefa */
export function removeTagFromTask(taskId, tagId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield request(`${ENDPOINT}/${taskId}/tags/${tagId}`, {
            method: "DELETE",
        });
        return result !== null;
    });
}
/* Função para deletar um comentário */
export function deleteTaskComment(taskId, commentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield request(`${ENDPOINT}/${taskId}/comments/${commentId}`, {
            method: "DELETE",
        });
        return result !== null;
    });
}
