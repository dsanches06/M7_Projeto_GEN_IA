var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskDependencies from "../api/fetchTaskDependencies.js";
/* Serviço para gerenciar dependências de tarefas */
export class TaskDependencyService {
    /* Função para obter a lista de dependências de tarefas */
    static getTaskDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskDependencies.getTaskDependencies();
        });
    }
    /* Função para obter uma dependência de tarefa por ID */
    static getTaskDependencyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskDependencies.getTaskDependencyById(id);
        });
    }
    /* Função para criar uma nova dependência de tarefa */
    static createTaskDependency(dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskDependencies.createTaskDependency(dependency);
        });
    }
    /* Função para atualizar uma dependência de tarefa existente */
    static updateTaskDependency(id, dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskDependencies.updateTaskDependency(id, dependency);
        });
    }
    /* Função para excluir uma dependência de tarefa */
    static deleteTaskDependency(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskDependencies.deleteTaskDependency(id);
        });
    }
}
