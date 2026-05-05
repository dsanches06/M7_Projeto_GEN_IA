import { UserRole } from "../security/UserRole.js";

/* Funções para verificar permissões baseadas no papel do utilizador */
export function canCreatetask(role: UserRole): boolean {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.MANAGER ||
    role === UserRole.MEMBER
  );
}

/* Função para verificar se o utilizador pode editar uma tarefa */
export function canEditTask(role: UserRole): boolean {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.MANAGER ||
    role === UserRole.MEMBER
  );
}

/* Função para verificar se o utilizador pode eliminar uma tarefa */
export function canDeletetask(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MANAGER;
}

/* Função para verificar se o utilizador pode atribuir uma tarefa */
export function canAssignTask(role: UserRole): boolean {
  return (
    role === UserRole.ADMIN ||
    role === UserRole.MANAGER ||
    role === UserRole.MEMBER
  );
}
