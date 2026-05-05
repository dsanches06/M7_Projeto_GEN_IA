/* Serviço para gerenciar deadlines de tarefas */
export class DeadlineService {
    /* Define a data limite para uma tarefa */
    static setDeadline(taskId, date) {
        this.deadlines.set(taskId, date);
    }
    /* Obtém a data limite de uma tarefa */
    static isExpired(taskId) {
        const deadline = this.deadlines.get(taskId);
        if (!deadline)
            return false;
        return deadline.getTime() < this.getCurrentTimestamp();
    }
    /* Obtém todas as tarefas expiradas */
    static getExpiredTasks() {
        const now = this.getCurrentTimestamp();
        const expiredTasks = [];
        for (const [taskId, deadline] of this.deadlines.entries()) {
            if (deadline.getTime() < now) {
                expiredTasks.push(taskId);
            }
        }
        return expiredTasks;
    }
    /* Obtém o timestamp atual */
    static getCurrentTimestamp() {
        return Date.now();
    }
}
/* Associar uma data limite a cada task */
DeadlineService.deadlines = new Map();
