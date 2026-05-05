var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchFavoriteTasks from "../api/fetchFavoriteTasks.js";
/* Serviço para gerenciar tarefas favoritas */
export class FavoriteTaskService {
    /* Função para obter a lista de tarefas favoritas */
    static getFavoriteTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchFavoriteTasks.getFavoriteTasks();
        });
    }
    /* Função para obter uma tarefa favorita por ID */
    static getFavoriteTaskById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchFavoriteTasks.getFavoriteTaskById(id);
        });
    }
    /* Função para criar uma nova tarefa favorita */
    static createFavoriteTask(favoriteTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchFavoriteTasks.createFavoriteTask(favoriteTask);
        });
    }
    /* Função para atualizar uma tarefa favorita existente */
    static updateFavoriteTask(id, favoriteTask) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchFavoriteTasks.updateFavoriteTask(id, favoriteTask);
        });
    }
    /* Função para excluir uma tarefa favorita */
    static deleteFavoriteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchFavoriteTasks.deleteFavoriteTask(id);
        });
    }
}
