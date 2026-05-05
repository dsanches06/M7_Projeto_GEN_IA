var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskStatusHistory from "../api/fetchTaskStatusHistory.js";
/* Serviço para gerenciar histórico de status de tarefas */
export class TaskStatusHistoryService {
    /* Função para obter a lista de históricos de status de tarefas */
    static getTaskStatusHistories() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatusHistory.getTaskStatusHistories();
        });
    }
    /* Função para obter um histórico de status de tarefa por ID */
    static getTaskStatusHistoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatusHistory.getTaskStatusHistoryById(id);
        });
    }
    /* Função para criar um novo histórico de status de tarefa */
    static createTaskStatusHistory(history) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatusHistory.createTaskStatusHistory(history);
        });
    }
    /* Função para atualizar um histórico de status de tarefa existente */
    static updateTaskStatusHistory(id, history) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatusHistory.updateTaskStatusHistory(id, history);
        });
    }
    /* Função para excluir um histórico de status de tarefa */
    static deleteTaskStatusHistory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatusHistory.deleteTaskStatusHistory(id);
        });
    }
}
