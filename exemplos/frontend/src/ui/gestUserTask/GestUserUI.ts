import { showInfoBanner } from "../../helpers/infoBanner.js";
import { IUser } from "../../models/index.js";
import {
  TaskService,
  UserService,
} from "../../services/index.js";
import { clearContainer } from "../dom/index.js";
import { loadUsersPage } from "../users/index.js";

const ENDPOINT = "users";

/* Função principal para carregar utilizadores iniciais */
export async function loadInitialUsers(): Promise<void> {
  try {
    //Limpa o container antes de mostrar os utilizadores
    clearContainer("#containerSection");

    const users = await UserService.getUsers();

    if (!users || users.length === 0) {
      console.warn("Nenhum utilizador foi retornado");
      showInfoBanner("Nenhum utilizador disponível", "warning-banner");
    }

    await loadUsersPage(users);
  } catch (error) {
    console.error("Erro ao carregar utilizadores:", error);
    showInfoBanner("Erro ao carregar utilizadores", "error-banner");
  }
}

/* Remover utilizador */
export async function removeUserByID(id: number): Promise<void> {
  await UserService.deleteUser(id);
}

/* Alternar estado (ativo / inativo) */
export async function toggleUserState(id: number): Promise<void> {
  try {
    // Obter o estado atual do utilizador da lista em memória
    const allUsers = await UserService.getUsers();
    const user = allUsers.find((u) => u.getId() === id);

    if (user) {
      const newState = !user.isActive();
      await UserService.toggleUserActive(id, newState);
      showInfoBanner(`O estado do utilizador foi alterado.`, "info-banner");
    } else {
      showInfoBanner(`Utilizador não encontrado.`, "info-banner");
    }
  } catch (error) {
    showInfoBanner(
      `Erro ao alternar estado do utilizador: ${error}`,
      "error-banner",
    );
  }
}

export async function getActiveUsers(): Promise<IUser[]> {
  const users = await UserService.getUsers();
  return users.filter((user) => user.isActive());
}

export async function getInactiveUsers(): Promise<IUser[]> {
  const users = await UserService.getUsers();
  return users.filter((user) => !user.isActive());
}

/* Procurar utilizador por nome */
export async function searchUserByName(name: string): Promise<IUser[]> {
  try {
    return await UserService.getUsers(undefined, name);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

/* Ordenar utilizadores por nome */
export async function sortUsersByName(
  ascending: boolean = true,
): Promise<IUser[]> {
  try {
    const sort = ascending ? "asc" : "desc";
    return await UserService.getUsers(sort, undefined);
  } catch (error) {
    console.error("Erro ao ordenar usuários:", error);
    return [];
  }
}
