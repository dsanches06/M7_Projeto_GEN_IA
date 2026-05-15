// Modelo de dados para uma notificação
class Notification {
  constructor(id, title, message, isRead, sentAt) {
    this.id = id;
    this.title = title;
    this.message = message;
    // Normaliza is_read: 0 → false, 1 → true, boolean directo
    this.isRead = isRead === 0 ? false : isRead === 1 ? true : Boolean(isRead);
    // Converte string ISO para objecto Date
    this.sentAt = typeof sentAt === "string" ? new Date(sentAt) : sentAt;
  }

  // Devolve o título da notificação
  getTitle() {
    return this.title;
  }

  // Devolve a mensagem da notificação
  getMessage() {
    return this.message;
  }

  // Indica se a notificação já foi lida
  isNotificationRead() {
    return this.isRead;
  }

  // Devolve a data de envio
  getSentAt() {
    return this.sentAt;
  }

  // Marca a notificação como lida
  markAsRead() {
    this.isRead = true;
  }
}

export default Notification;
