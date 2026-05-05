import { BaseEntity } from "../models/index.js";
import { INotifications } from "./INotifications.js";

/* Representação de uma notificação */
export default class Notifications
  extends BaseEntity
  implements INotifications
{
  private title: string;
  private message: string;
  private isRead: boolean;
  private sentAt: Date;

  constructor(
    id: number,
    title: string,
    message: string,
    isRead: boolean | number,
    sentAt: string | Date,
  ) {
    super(id);
    this.title = title;
    this.message = message;
    this.isRead = isRead === 0 ? false : isRead === 1 ? true : Boolean(isRead);
    this.sentAt = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
  }

  getTitle(): string {
    return this.title;
  }

  getMessage(): string {
    return this.message;
  }

  isNotificationRead(): boolean {
    return this.isRead;
  }

  getSentAt(): Date {
    return this.sentAt;
  }

  markAsRead(): void {
    this.isRead = true;
  }
}
