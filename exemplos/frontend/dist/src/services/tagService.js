var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTags from "../api/fetchTags.js";
/* Serviço para gerenciar tags */
export class TagService {
    /* Função para obter a lista de tags */
    static getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.getTags();
        });
    }
    /* Função para obter uma tag por ID */
    static getTagById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.getTagById(id);
        });
    }
    /* Função para obter tarefas associadas a uma tag */
    static getTagTasks(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.getTasksByTag(id);
        });
    }
    /* Função para criar uma nova tag */
    static createTag(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.createTag(tag);
        });
    }
    /* Função para atualizar uma tag existente */
    static updateTag(id, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.updateTag(id, tag);
        });
    }
    /* Função para excluir uma tag */
    static deleteTag(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTags.deleteTag(id);
        });
    }
}
