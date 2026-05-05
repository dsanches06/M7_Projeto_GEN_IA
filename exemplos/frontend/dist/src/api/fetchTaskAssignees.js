var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove, request } from "./index.js";
const ENDPOINT = "task_assignees";
/* Função para obter a lista de atribuíções de tarefas */
export function getTaskAssignees(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma atribuição de tarefa por ID */
export function getTaskAssigneeById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para obter atribuições de tarefas de um utilizador */
export function getTaskAssigneesByUserId(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield request(`${ENDPOINT}/${userId}`);
        return Array.isArray(data) ? data : [];
    });
}
/* Função para criar uma nova atribuição de tarefa */
export function createTaskAssignee(assignee) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, assignee);
    });
}
/* Função para atualizar uma atribuição de tarefa */
export function updateTaskAssignee(id, assignee) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, assignee);
    });
}
/* Função para deletar uma atribuição de tarefa */
export function deleteTaskAssignee(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
