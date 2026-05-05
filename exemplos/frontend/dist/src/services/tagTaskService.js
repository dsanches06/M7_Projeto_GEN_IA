var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTagTask from "../api/fetchTagTask.js";
/* Serviço para gerenciar relação tag-tarefa */
export class TagTaskService {
    /* Função para obter a lista de tags-tarefas */
    static getTagTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTagTask.getTagTasks();
        });
    }
    /* Função para obter uma tag-tarefa por ID */
    static getTagTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTagTask.getTagTaskById(id);
        });
    }
    /* Função para criar uma nova relação tag-tarefa */
    static createTagTask(tagTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTagTask.createTagTask(tagTask);
        });
    }
    /* Função para atualizar uma relação tag-tarefa existente */
    static updateTagTask(id, tagTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTagTask.updateTagTask(id, tagTask);
        });
    }
    /* Função para excluir uma relação tag-tarefa */
    static deleteTagTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTagTask.deleteTagTask(id);
        });
    }
}
