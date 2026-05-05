var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTasks from "../api/fetchTasks.js";
import { mapToTask } from "../api/dto/mapperDTO.js";
import { TaskAssigneeService } from "./taskAssigneeService.js";
/* Serviço para gerir tarefas */
export class TaskService {
    /* Obtém tarefas da API com os assignees associados */
    static getTasks(sort, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchTasks.getTasks(sort, search);
            const tasks = data.map(mapToTask);
            // Carregar assignees e associar a cada tarefa
            try {
                const assignees = yield TaskAssigneeService.getTaskAssignees();
                // Para cada tarefa, encontrar os assignees correspondentes
                tasks.forEach((task) => {
                    const taskAssignees = assignees.filter((a) => a.task_id === task.getId());
                    task.setAssignees(taskAssignees);
                    if (taskAssignees.length > 0) {
                    }
                });
            }
            catch (error) {
                console.error("Erro ao carregar assignees para tarefas:", error);
            }
            return tasks;
        });
    }
    /* Obtém tarefas de um projeto específico */
    static getTasksByProject(projectId, sort, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchTasks.getTasksByProject(projectId, sort, search);
            const tasks = data.map(mapToTask);
            // Carregar assignees e associar a cada tarefa
            try {
                const assignees = yield TaskAssigneeService.getTaskAssignees();
                // Para cada tarefa, encontrar os assignees correspondentes
                tasks.forEach((task) => {
                    const taskAssignees = assignees.filter((a) => a.task_id === task.getId());
                    task.setAssignees(taskAssignees);
                    if (taskAssignees.length > 0) {
                    }
                });
            }
            catch (error) {
                console.error("Erro ao carregar assignees para tarefas:", error);
            }
            return tasks;
        });
    }
    /* Obtém uma tarefa por ID da API */
    static getTaskById(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchTasks.getTaskById(taskId);
            if (!data) {
                throw new Error("Tarefa não encontrada");
            }
            return mapToTask(data);
        });
    }
    /* Obtém estatísticas de tarefas da API */
    static getTaskStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.getTaskStats();
        });
    }
    /* Obtém tags de uma tarefa da API */
    static getTaskTags(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.getTaskTags(taskId);
        });
    }
    /* Obtém comentários de uma tarefa da API */
    static getTaskComments(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.getTaskComments(taskId);
        });
    }
    /* Cria um nova tarefa na API */
    static createTask(taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchTasks.createTask(taskData);
            return data ? mapToTask(data) : null;
        });
    }
    /* Adiciona uma tag a uma tarefa na API */
    static addTagToTask(taskId, tagData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.addTagToTask(taskId, tagData);
        });
    }
    /* Remove uma tag de uma tarefa na API */
    static removeTagFromTask(taskId, tagId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.removeTagFromTask(taskId, tagId);
        });
    }
    /* Cria um comentário em uma tarefa na API */
    static createTaskComment(taskId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.createTaskComment(taskId, commentData);
        });
    }
    /* Atualiza uma tarefa na API */
    static updateTask(taskId, taskData) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchTasks.updateTask(taskId, taskData);
            return data ? mapToTask(data) : null;
        });
    }
    /* Função para atualizar parcialmente uma tarefa (datas, descrição, etc) */
    static partialUpdateTask(taskId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.partialUpdateTask(taskId, updates);
        });
    }
    /* Atualiza um comentário na API */
    static updateTaskComment(taskId, commentId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.updateTaskComment(taskId, commentId, commentData);
        });
    }
    /* Atualiza o status de uma tarefa na API */
    static updateTaskStatus(taskId, statusId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.changeTaskStatus(taskId, statusId);
        });
    }
    /* Deleta uma tarefa na API */
    static deleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.deleteTask(taskId);
        });
    }
}
