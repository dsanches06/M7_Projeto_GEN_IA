var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchNotifications from "../api/fetchNotifications.js";
/* Serviço para gerenciar notificações */
export class NotificationService {
    /* Obtém a lista de notificações da API */
    static getNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchNotifications.getNotifications();
        });
    }
    /* Obtém uma notificação por ID da API */
    static getNotificationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchNotifications.getNotificationById(id);
        });
    }
    /* Cria uma nova notificação na API */
    static createNotification(notification) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchNotifications.createNotification(notification);
        });
    }
    /* Atualiza uma notificação na API */
    static updateNotification(id, notification) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchNotifications.updateNotification(id, notification);
        });
    }
    /* Exclui uma notificação na API */
    static deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchNotifications.deleteNotification(id);
        });
    }
}
