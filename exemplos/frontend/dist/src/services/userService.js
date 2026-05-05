var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { apiCreateUser, apiGetNotificationsByUser, apiGetUnreadNotifications, apiGetUserById, apiGetUsers, apiGetUserStats, apiMarkNotificationAsRead, apiToggleUserActive, apiUpdateUser, apiDeleteUser, } from "../api/index.js";
/* Serviço para gerenciar usuários */
export class UserService {
    /* Função para obter a lista de usuários */
    static getUsers(sort, search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiGetUsers(sort, search);
        });
    }
    /* Função para obter um usuário por ID da API */
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiGetUserById(id);
        });
    }
    /* Função para obter estatísticas de usuário */
    static getUserStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiGetUserStats();
        });
    }
    /* Função para obter notificações não lidas do usuário */
    static getUnreadNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiGetUnreadNotifications(userId);
        });
    }
    /* Função para obter todas as notificações do usuário */
    static getNotificationsByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiGetNotificationsByUser(userId);
        });
    }
    /* Função para criar um novo usuário */
    static createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiCreateUser(userData);
        });
    }
    /* Função para atualizar um usuário */
    static updateUser(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiUpdateUser(userId, userData);
        });
    }
    /* Função para alternar ativo/inativo do usuário */
    static toggleUserActive(userId, active) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiToggleUserActive(userId, active);
        });
    }
    /* Função para marcar notificação como lida */
    static markNotificationAsRead(userId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiMarkNotificationAsRead(userId, notificationId);
        });
    }
    /* Função para deletar um usuário */
    static deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield apiDeleteUser(userId);
        });
    }
}
