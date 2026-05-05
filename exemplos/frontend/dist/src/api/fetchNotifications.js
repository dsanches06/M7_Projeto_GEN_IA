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
const ENDPOINT = "notifications";
/* Função para obter a lista de notificações */
export function getNotifications(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter uma notificação específica por ID */
export function getNotificationById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar uma nova notificação */
export function createNotification(notification) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, notification);
    });
}
/* Função para atualizar uma notificação existente */
export function updateNotification(id, notification) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, notification);
    });
}
/* Função para excluir uma notificação por ID */
export function deleteNotification(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
