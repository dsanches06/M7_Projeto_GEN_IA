import { taskStatusService } from "../services/index.js";


/* Devolve todos os estados de tarefa */
export const getTaskStatuses = async (req, res) => {
  try {
    const taskStatuses = await taskStatusService.getAllTaskStatuses();
    res.json(taskStatuses);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar status de tarefa" });
  }
};


/* Devolve um estado de tarefa pelo ID */
export const getTaskStatusById = async (req, res) => {
  try {
    const taskStatus = await taskStatusService.getTaskStatusById(Number(req.params.id));
    if (!taskStatus) {
      return res.status(404).json({ error: "Status de tarefa não encontrado" });
    }
    res.json(taskStatus);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar status de tarefa" });
  }
};


/* Cria um novo estado de tarefa */
export const createTaskStatus = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "O nome do status não pode ser vazio" });
    }
    const taskStatus = await taskStatusService.createTaskStatus(req.body);
    res.status(201).json(taskStatus);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar status de tarefa" });
  }
};


/* Actualiza um estado de tarefa pelo ID */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await taskStatusService.updateTaskStatus(id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Status de tarefa não encontrado" });
    }
    res.json({ message: "Status de tarefa atualizado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar status de tarefa" });
  }
};


/* Elimina um estado de tarefa pelo ID */
export const deleteTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await taskStatusService.deleteTaskStatus(id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Status de tarefa não encontrado" });
    }
    res.json({ message: "Status de tarefa deletado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao deletar status de tarefa" });
  }
};
