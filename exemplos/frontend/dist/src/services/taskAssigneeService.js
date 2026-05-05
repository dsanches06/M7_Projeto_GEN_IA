var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskAssignees from "../api/fetchTaskAssignees.js";
/* Serviço para gerenciar atribuições de tarefas */
export class TaskAssigneeService {
    /* Função para obter a lista de atribuições de tarefas */
    static getTaskAssignees() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.getTaskAssignees();
        });
    }
    /* Função para obter uma atribuição de tarefa por ID */
    static getTaskAssigneeById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.getTaskAssigneeById(id);
        });
    }
    /* Função para obter atribuições de tarefas de um utilizador */
    static getTaskAssigneesByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.getTaskAssigneesByUserId(userId);
        });
    }
    /* Função para criar uma nova atribuição de tarefa */
    static createTaskAssignee(assignee) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.createTaskAssignee(assignee);
        });
    }
    /* Função para atualizar uma atribuição de tarefa existente */
    static updateTaskAssignee(id, assignee) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.updateTaskAssignee(id, assignee);
        });
    }
    /* Função para excluir uma atribuição de tarefa */
    static deleteTaskAssignee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAssignees.deleteTaskAssignee(id);
        });
    }
}
