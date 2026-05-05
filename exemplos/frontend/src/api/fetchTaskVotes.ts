import { get, getById, create, put, remove } from "./index.js";
import { TaskVoteDTORequest } from "./dto/index.js";

const ENDPOINT = "task_votes";

/* Função para obter a lista de votos de tarefas */
export async function getTaskVotes(
  sort?: string,
  search?: string,
): Promise<TaskVoteDTORequest[]> {
  return get<TaskVoteDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter um voto de tarefa por ID */
export async function getTaskVoteById(
  id: number,
): Promise<TaskVoteDTORequest | null> {
  return getById<TaskVoteDTORequest>(ENDPOINT, id);
}

/* Função para criar um novo voto de tarefa */
export async function createTaskVote(
  vote: Partial<TaskVoteDTORequest>,
): Promise<TaskVoteDTORequest | null> {
  return create<TaskVoteDTORequest>(ENDPOINT, vote);
}

/* Função para atualizar um voto de tarefa */
export async function updateTaskVote(
  id: number,
  vote: Partial<TaskVoteDTORequest>,
): Promise<TaskVoteDTORequest | null> {
  return put<TaskVoteDTORequest>(ENDPOINT, id, vote);
}

/* Função para deletar um voto de tarefa */
export async function deleteTaskVote(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

