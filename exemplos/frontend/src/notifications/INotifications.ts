/* Interface para uma notificação */
export interface INotifications {
  getId(): number;
  getTitle(): string;
  getMessage(): string;
  isNotificationRead(): boolean;
  getSentAt(): Date;
  markAsRead(): void;
}
