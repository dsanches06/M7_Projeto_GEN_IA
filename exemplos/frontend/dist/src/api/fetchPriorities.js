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
const ENDPOINT = "priorities";
/* Função para obter todos as prioridades  */
export function getPriorities(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma prioridade pelo id */
export function getPriorityById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova prioridade  */
export function createPriority(priority) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, priority);
    });
}
/* Função para editar ou atualizar os dados de uma prioridade  */
export function updatePriority(id, priority) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, priority);
    });
}
/* Função para deletar uma prioridade */
export function deletePriority(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
