var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchMentions from "../api/fetchMentions.js";
/* Serviço para gerenciar menções */
export class MentionService {
    /* Função para obter a lista de menções */
    static getMentions() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchMentions.getMentions();
        });
    }
    /* Função para obter uma menção por ID */
    static getMentionById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchMentions.getMentionById(id);
        });
    }
    /* Função para criar uma nova menção */
    static createMention(mention) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchMentions.createMention(mention);
        });
    }
    /* Função para atualizar uma menção existente */
    static updateMention(id, mention) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchMentions.updateMention(id, mention);
        });
    }
    /* Função para excluir uma menção */
    static deleteMention(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchMentions.deleteMention(id);
        });
    }
}
