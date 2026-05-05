var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove } from "./index.js";
const ENDPOINT = "task_status";
/* Função para obter todos os status de tarefa */
export function getTaskStatuses(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um status de tarefa por ID */
export function getTaskStatusById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo status de tarefa */
export function createTaskStatus(status) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, status);
    });
}
/* Função para atualizar um status de tarefa */
export function updateTaskStatus(id, status) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, status);
    });
}
/* Função para deletar um status de tarefa */
export function deleteTaskStatus(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
