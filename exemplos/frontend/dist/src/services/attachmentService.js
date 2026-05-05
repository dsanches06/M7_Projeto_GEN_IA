var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTaskAttachments from "../api/fetchTaskAttachments.js";
/* Serviço para gerir anexos associados a tarefas */
export class AttachmentService {
    /* Obtém a lista de anexos de tarefas da API */
    static getTaskAttachments() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAttachments.getTaskAttachments();
        });
    }
    /* Obtém um anexo de tarefa por ID da API */
    static getTaskAttachmentById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAttachments.getTaskAttachmentById(id);
        });
    }
    /* Cria um novo anexo de tarefa na API */
    static createTaskAttachment(attachment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAttachments.createTaskAttachment(attachment);
        });
    }
    /* Atualiza um anexo de tarefa na API */
    static updateTaskAttachment(id, attachment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAttachments.updateTaskAttachment(id, attachment);
        });
    }
    /* Exclui um anexo de tarefa na API */
    static deleteTaskAttachment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTaskAttachments.deleteTaskAttachment(id);
        });
    }
}
