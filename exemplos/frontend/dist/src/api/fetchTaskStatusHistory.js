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
const ENDPOINT = "task_status_history";
/* Função para obter a lista do histórico de status de tarefas */
export function getTaskStatusHistories(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um registro de histórico de status por ID */
export function getTaskStatusHistoryById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo registro de histórico de status */
export function createTaskStatusHistory(history) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, history);
    });
}
/* Função para editar ohistórico de status */
export function updateTaskStatusHistory(id, history) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, history);
    });
}
/* Função para deletar um registro de histórico de status */
export function deleteTaskStatusHistory(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
