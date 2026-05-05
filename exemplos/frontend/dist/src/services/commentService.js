var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTasks from "../api/fetchTasks.js";
/* Serviço para gerir comentários associados a tarefas */
export class CommentService {
    /* Obtém comentários de uma tarefa da API */
    static getTaskComments(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.getTaskComments(taskId);
        });
    }
    /* Cria um comentário em uma tarefa na API */
    static createTaskComment(taskId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.createTaskComment(taskId, commentData);
        });
    }
    /* Atualiza um comentário na API */
    static updateTaskComment(taskId, commentId, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTasks.updateTaskComment(taskId, commentId, commentData);
        });
    }
}
