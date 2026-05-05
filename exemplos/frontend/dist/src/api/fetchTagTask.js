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
const ENDPOINT = "tags_task";
/* Função para obter a lista de relações de tags em tarefas */
export function getTagTasks(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma relação de tag em tarefa por ID */
export function getTagTaskById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova relação de tag em tarefa */
export function createTagTask(tagTask) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, tagTask);
    });
}
/* Função para atualizar uma relação de tag em tarefa */
export function updateTagTask(id, tagTask) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, tagTask);
    });
}
/* Função para deletar uma relação de tag em tarefa */
export function deleteTagTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
