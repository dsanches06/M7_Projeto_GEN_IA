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
const ENDPOINT = "task_attachments";
/* Função para obter a lista de anexos de tarefas */
export function getTaskAttachments(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um anexo de tarefa por ID */
export function getTaskAttachmentById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo anexo de tarefa */
export function createTaskAttachment(attachment) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, attachment);
    });
}
/* Função para atualizar um anexo de tarefa */
export function updateTaskAttachment(id, attachment) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, attachment);
    });
}
/* Função para deletar um anexo de tarefa */
export function deleteTaskAttachment(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
