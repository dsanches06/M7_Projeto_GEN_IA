var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, patch, remove, request } from "./index.js";
import { mapToUserClass, mapToNotifications, } from "./dto/index.js";
const ENDPOINT = "users";
/* Função para obter a lista de utilizadores */
export function apiGetUsers(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield get(ENDPOINT, sort, search);
        return data.map(mapToUserClass);
    });
}
/* Função para obter um utilizador por ID */
export function apiGetUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield getById(ENDPOINT, id);
        return data ? mapToUserClass(data) : null;
    });
}
/* Função para obter estatísticas de utilizadores */
export function apiGetUserStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield request(`${ENDPOINT}/stats`);
        return stats || null;
    });
}
/* Função para obter notificações não lidas do utilizador */
export function apiGetUnreadNotifications(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield request(`${ENDPOINT}/${userId}/notifications/unread`);
        if (!data)
            return [];
        const notifications = Array.isArray(data)
            ? data.map(mapToNotifications)
            : [mapToNotifications(data)];
        return notifications;
    });
}
/* Função para obter todas as notificações do utilizador */
export function apiGetNotificationsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield request(`${ENDPOINT}/${userId}/notifications`);
        if (!data)
            return [];
        const notifications = Array.isArray(data)
            ? data.map(mapToNotifications)
            : [mapToNotifications(data)];
        return notifications;
    });
}
/* ======================== POST ======================== */
/* Função para criar um novo utilizador */
export function apiCreateUser(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield create(ENDPOINT, userData);
        return data ? mapToUserClass(data) : null;
    });
}
/* Função para atualizar um utilizador */
export function apiUpdateUser(userId, userData) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield put(ENDPOINT, userId, userData);
        return data ? mapToUserClass(data) : null;
    });
}
/* Função para ativar/desativar um utilizador */
export function apiToggleUserActive(userId, active) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield patch(ENDPOINT, userId, {
            active: active ? 1 : 0,
        });
        return data ? mapToUserClass(data) : null;
    });
}
/* Função para marcar uma notificação como lida */
export function apiMarkNotificationAsRead(userId, notificationId) {
    return __awaiter(this, void 0, void 0, function* () {
        return request(`${ENDPOINT}/${userId}/notifications/${notificationId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        });
    });
}
/* Função para deletar um utilizador */
export function apiDeleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, userId);
    });
}
