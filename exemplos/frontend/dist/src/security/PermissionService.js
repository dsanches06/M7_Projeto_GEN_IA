import { UserRole } from "../security/UserRole.js";
/* Funções para verificar permissões baseadas no papel do utilizador */
export function canCreatetask(role) {
    return (role === UserRole.ADMIN ||
        role === UserRole.MANAGER ||
        role === UserRole.MEMBER);
}
/* Função para verificar se o utilizador pode editar uma tarefa */
export function canEditTask(role) {
    return (role === UserRole.ADMIN ||
        role === UserRole.MANAGER ||
        role === UserRole.MEMBER);
}
/* Função para verificar se o utilizador pode eliminar uma tarefa */
export function canDeletetask(role) {
    return role === UserRole.ADMIN || role === UserRole.MANAGER;
}
/* Função para verificar se o utilizador pode atribuir uma tarefa */
export function canAssignTask(role) {
    return (role === UserRole.ADMIN ||
        role === UserRole.MANAGER ||
        role === UserRole.MEMBER);
}
