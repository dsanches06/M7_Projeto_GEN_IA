import { BaseEntity } from "../models/index.js";
/* Representação de uma notificação */
export default class Notifications extends BaseEntity {
    constructor(id, title, message, isRead, sentAt) {
        super(id);
        this.title = title;
        this.message = message;
        this.isRead = isRead === 0 ? false : isRead === 1 ? true : Boolean(isRead);
        this.sentAt = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
    }
    getTitle() {
        return this.title;
    }
    getMessage() {
        return this.message;
    }
    isNotificationRead() {
        return this.isRead;
    }
    getSentAt() {
        return this.sentAt;
    }
    markAsRead() {
        this.isRead = true;
    }
}
