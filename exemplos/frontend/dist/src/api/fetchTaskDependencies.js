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
const ENDPOINT = "task_dependencies";
/* Função para obter a lista de dependências de tarefas */
export function getTaskDependencies(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma dependência de tarefa por ID */
export function getTaskDependencyById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova dependência de tarefa */
export function createTaskDependency(dependency) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, dependency);
    });
}
/* Função para atualizar uma dependência de tarefa */
export function updateTaskDependency(id, dependency) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, dependency);
    });
}
/* Função para deletar uma dependência de tarefa */
export function deleteTaskDependency(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
