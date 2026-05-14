import { taskService, tagService, userService } from "../services/index.js";
import { normalizeTaskFields, normalizeTagFields } from "../utils/fieldMapper.js";

/* Função para buscar tarefas */
export const getTasks = async (req, res) => {
  try {
    const { sort, search } = req.query;
    const tasks = await taskService.getAllTasks(search, sort);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

/* Função para buscar tarefa por ID */
export const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
};

/* Função para criar tarefa */
export const createTask = async (req, res) => {
  try {
    const normalized = normalizeTaskFields(req.body);
    const userId = normalized.user_id != null ? Number(normalized.user_id) : null;

    if (normalized.user_id != null) {
      if (!userId || userId <= 0) {
        return res.status(400).json({ error: "user_id inválido" });
      }

      const existingUser = await userService.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ error: `Utilizador ${userId} não encontrado.` });
      }
    }

    const task = await taskService.createTask(normalized);
    res.status(201).json(task);
  } catch (error) {
    if (error.message.includes("não encontrada") || error.message.includes("não encontrado")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: "Erro ao criar tarefa" });
  }
};

/* Função para atualizar tarefa */
export const updateTask = async (req, res) => {
  try {
    const normalized = normalizeTaskFields(req.body);
    const result = await taskService.updateTask(
      Number(req.params.id),
      normalized,
    );
    if (result === 0) {
      return res
        .status(404)
        .json({ message: "Tarefa não encontrada ou sem alterações" });
    }
    res.json(result);
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: "Erro ao atualizar tarefa" });
  }
};

/* Função para atualizar parcialmente tarefa (PATCH) - para datas, descrição, etc */
export const partialUpdateTask = async (req, res) => {
  try {
    const normalized = normalizeTaskFields(req.body);
    const result = await taskService.updateTask(
      Number(req.params.id),
      normalized,
    );
    if (result === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json({ message: "Tarefa atualizada com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({ error: "Erro ao atualizar tarefa" });
  }
};

/* Função para marcar tarefa como concluída */
export const updateStatus = async (req, res) => {
  try {
    const normalized = normalizeTaskFields(req.body);
    const task = await taskService.updateStatus(
      Number(req.params.id),
      normalized,
    );
    res.json({ message: "Status da tarefa atualizado com sucesso", task });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(400).json({
      error: `Erro ao atualizar status da tarefa: ${error.message}`,
    });
  }
};

/* Função para deletar tarefa */
export const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(Number(req.params.id));
    res.status(200).json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: `Erro ao deletar tarefa: ${error.message}` });
  }
};

/* Função para buscar estatísticas das tarefas */
export const getStats = async (req, res) => {
  try {
    const stats = await taskService.getTaskStats();
    res.json(stats);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Erro ao buscar estatísticas: ${error.message}` });
  }
};

/* Função para adicionar etiqueta à tarefa */
export const addTagToTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const normalized = normalizeTagFields(req.body);
    const tagId = Number(normalized.tag_id || 0);

    const relation = await taskService.addTagToTask(taskId, tagId);
    res.status(201).json(relation);
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("já associada")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(400).json({
      message: `Erro ao adicionar etiqueta à tarefa: ${error.message}`,
    });
  }
};

/* Função para remover etiqueta da tarefa */
export const removeTagFromTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const tagId = Number(req.params.tagId);

    if (!tagId) {
      return res
        .status(400)
        .json({ message: "O ID da etiqueta é obrigatório" });
    }

    const relation = await taskService.removeTagFromTask(taskId, tagId);
    if (!relation) {
      return res.status(404).json({ message: "Etiqueta não encontrada na tarefa" });
    }
    res
      .status(200)
      .json({ message: "Etiqueta removida da tarefa com sucesso", relation });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("inválido")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(400).json({
      message: `Erro ao remover etiqueta da tarefa: ${error.message}`,
    });
  }
};

/* Função para buscar etiquetas da tarefa */
export const getTaskTags = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const tags = await taskService.getTagsByTaskId(taskId);

    const tagDetails = await Promise.all(
      tags.map((relation) => tagService.getTagById(relation.tag_id)),
    );
    res.json(tagDetails);
  } catch (error) {
    res.status(500).json({
      message: `Erro ao buscar etiquetas da tarefa: ${error.message}`,
    });
  }
};

