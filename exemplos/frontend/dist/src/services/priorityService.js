var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchPriorities from "../api/fetchPriorities.js";
/* Serviço para gerenciar prioridades */
export class PriorityService {
    /* Função para obter a lista de prioridades */
    static getPriorities() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchPriorities.getPriorities();
        });
    }
    /* Função para obter uma prioridade por ID */
    static getPriorityById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchPriorities.getPriorityById(id);
        });
    }
    /* Função para criar uma nova prioridade */
    static createPriority(priority) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchPriorities.createPriority(priority);
        });
    }
    /* Função para atualizar uma prioridade existente */
    static updatePriority(id, priority) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchPriorities.updatePriority(id, priority);
        });
    }
    /* Função para excluir uma prioridade */
    static deletePriority(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchPriorities.deletePriority(id);
        });
    }
}
