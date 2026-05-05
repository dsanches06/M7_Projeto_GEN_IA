var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskStatus from "../api/fetchTaskStatus.js";
/* Serviço para gerenciar status de tarefas */
export class TaskStatusService {
    /* Função para obter a lista de status de tarefas */
    static getTaskStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatus.getTaskStatuses();
        });
    }
    /* Função para obter um status de tarefa por ID */
    static getTaskStatusById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatus.getTaskStatusById(id);
        });
    }
    /* Função para criar um novo status de tarefa */
    static createTaskStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatus.createTaskStatus(status);
        });
    }
    /* Função para atualizar um status de tarefa existente */
    static updateTaskStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatus.updateTaskStatus(id, status);
        });
    }
    /* Função para excluir um status de tarefa */
    static deleteTaskStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskStatus.deleteTaskStatus(id);
        });
    }
}
