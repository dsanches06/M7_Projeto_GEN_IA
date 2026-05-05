var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskVotes from "../api/fetchTaskVotes.js";
/* Serviço para gerenciar votos de tarefas */
export class TaskVoteService {
    /* Função para obter a lista de votos de tarefas */
    static getTaskVotes() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskVotes.getTaskVotes();
        });
    }
    /* Função para obter um voto de tarefa por ID */
    static getTaskVoteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskVotes.getTaskVoteById(id);
        });
    }
    /* Função para criar um novo voto de tarefa */
    static createTaskVote(vote) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskVotes.createTaskVote(vote);
        });
    }
    /* Função para atualizar um voto de tarefa existente */
    static updateTaskVote(id, vote) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskVotes.updateTaskVote(id, vote);
        });
    }
    /* Função para excluir um voto de tarefa */
    static deleteTaskVote(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskVotes.deleteTaskVote(id);
        });
    }
}
