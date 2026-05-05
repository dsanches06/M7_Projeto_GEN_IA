import { get, getById, create, put, remove } from "./index.js";
import { MentionDTORequest } from "./dto/index.js";

const ENDPOINT = "mentions";

/* Função para obter a lista de menções */
export async function getMentions(
  sort?: string,
  search?: string,
): Promise<MentionDTORequest[]> {
  return get<MentionDTORequest>(ENDPOINT, sort, search);
}

/* Função para obter uma menção por ID */
export async function getMentionById(
  id: number,
): Promise<MentionDTORequest | null> {
  return getById<MentionDTORequest>(ENDPOINT, id);
}

/* Função para criar uma nova menção */
export async function createMention(
  mention: Partial<MentionDTORequest>,
): Promise<MentionDTORequest | null> {
  return create<MentionDTORequest>(ENDPOINT, mention);
}

/* Função para atualizar uma menção */
export async function updateMention(
  id: number,
  mention: Partial<MentionDTORequest>,
): Promise<MentionDTORequest | null> {
  return put<MentionDTORequest>(ENDPOINT, id, mention);
}

/* Função para deletar uma menção */
export async function deleteMention(id: number): Promise<boolean> {
  return remove(ENDPOINT, id);
}

