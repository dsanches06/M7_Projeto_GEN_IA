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
const ENDPOINT = "sprints";
/* ============================================
   SPRINTS
   ============================================ */
/* Função para obter a lista de sprints */
export function getSprints(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um sprint por ID */
export function getSprintById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo sprint */
export function createSprint(sprint) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, sprint);
    });
}
/* Função para atualizar um sprint */
export function updateSprint(id, sprint) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, sprint);
    });
}
/* Função para atualizar parcialmente um sprint (datas, descrição, etc) */
export function partialUpdateSprint(id, updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield patch(ENDPOINT, id, updates);
        return result !== null;
    });
}
/* Função para deletar um sprint */
export function deleteSprint(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
/* Função para obter estatísticas globais de sprints */
export function getSprintsStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + "/stats");
        return stats ? stats[0] || null : null;
    });
}
/* Função para obter estatísticas de um sprint */
export function getSprintStats(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield get(ENDPOINT + `/${id}/stats`);
        return stats ? stats[0] || null : null;
    });
}
/* ============================================
   SPRINT TASKS
   ============================================ */
/* Função para obter a lista de tarefas de um sprint */
export function getSprintTasks(sprintId, sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/${sprintId}/tasks`, sort, search);
    });
}
/* Função para obter TODAS as relações de sprints-tasks */
export function getAllSprintTasks(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/tasks`, sort, search);
    });
}
/* Função para obter uma tarefa de sprint por ID */
export function getSprintTaskById(taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(`${ENDPOINT}/tasks`, taskId);
    });
}
/* Função para criar uma nova tarefa de sprint */
export function createSprintTask(sprintId, sprintTask) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(`${ENDPOINT}/${sprintId}/tasks`, sprintTask);
    });
}
/* Função para atualizar uma tarefa de sprint */
export function updateSprintTask(sprintId, taskId, sprintTask) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(`${ENDPOINT}/${sprintId}/tasks`, taskId, sprintTask);
    });
}
/* Função para deletar uma tarefa de sprint */
export function deleteSprintTask(sprintId, taskId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield request(`${ENDPOINT}/${sprintId}/tasks/${taskId}`, {
            method: "DELETE",
        });
        return result !== null;
    });
}
