/* Serviço para aplicar regras de negócio */
export class BusinessRules {
    /* Verifica se um usuário pode ser desativado com base no número de tarefas ativas */
    static canUserBeDeactivated(activeTasks) {
        return activeTasks === 0 ? true : false;
    }
    /* Verifica se uma tarefa pode ser concluída com base no seu status de bloqueio */
    static canTaskBeCompleted(isBlocked) {
        return isBlocked === true ? false : true;
    }
    /* Verifica se uma tarefa pode ser atribuída com base no status ativo do usuário */
    static canAssignTask(active) {
        return active === true ? true : false;
    }
}
