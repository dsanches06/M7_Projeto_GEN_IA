/* Serviço para gerenciar deadlines de tarefas */
export class DeadlineService {
  
  /* Associar uma data limite a cada task */
  private static deadlines = new Map<number, Date>();

  /* Define a data limite para uma tarefa */
  static setDeadline(taskId: number, date: Date) {
    this.deadlines.set(taskId, date);
  }

  /* Obtém a data limite de uma tarefa */
  static isExpired(taskId: number) {
    const deadline = this.deadlines.get(taskId);
    if (!deadline) return false;
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
  private static getCurrentTimestamp() {
    return Date.now();
  }
}
