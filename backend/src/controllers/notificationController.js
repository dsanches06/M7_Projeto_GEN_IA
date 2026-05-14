import { notificationService } from "../services/index.js";
import { normalizeNotificationFields } from "../utils/fieldMapper.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID é obrigatório" });

    const notification = await notificationService.getNotificationById(Number(id));
    if (!notification) return res.status(404).json({ error: "Notificação não encontrada" });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: "Erro ao buscar notificação" });
  }
};

export const getNotificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

    const notifications = await notificationService.getNotificationsByUser(Number(userId));
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: "Erro ao buscar notificações" });
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId é obrigatório" });

    const notifications = await notificationService.getUnreadNotifications(Number(userId));
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar notificações não lidas" });
  }
};

export const createNotification = async (req, res) => {
  try {
    const normalized = normalizeNotificationFields(req.body);
    const { user_id, title, message } = normalized;

    if (!message || message.trim().length === 0)
      return res.status(400).json({ message: "A mensagem não pode ser vazia" });
    if (!user_id)
      return res.status(400).json({ message: "user_id é obrigatório" });

    const notification = await notificationService.createNotification({
      user_id,
      title: title || "Notification",
      message,
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar notificação" });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const normalized = normalizeNotificationFields(req.body);
    const { message } = normalized;
    
    if (message !== undefined && message.trim().length === 0)
      return res.status(400).json({ message: "A mensagem não pode ser vazia" });

    const affectedRows = await notificationService.updateNotification(
      Number(req.params.id),
      normalized,
    );
    if (affectedRows === 0)
      return res.status(404).json({ message: "Notificação não encontrada" });

    res.json({ message: "Notificação atualizada com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({ message: "Erro ao atualizar notificação" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID é obrigatório" });

    const affectedRows = await notificationService.deleteNotification(Number(id));
    if (affectedRows === 0)
      return res.status(404).json({ message: "Notificação não encontrada" });

    res.json({ message: "Notificação deletada com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao deletar notificação" });
  }
};
