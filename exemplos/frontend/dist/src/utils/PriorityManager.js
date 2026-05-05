/* Serviço para gerir prioridades associadas a tarefas */
export class PriorityManager {
    constructor() {
        this.priorities = new Map();
    }
    setPriority(item, value) {
        this.priorities.set(item, value);
    }
    getPriority(item) {
        return this.priorities.get(item);
    }
}
