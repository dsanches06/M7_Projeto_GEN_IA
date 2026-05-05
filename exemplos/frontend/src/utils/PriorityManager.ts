/* Serviço para gerir prioridades associadas a tarefas */
export class PriorityManager<T> {
  private priorities: Map<T, number>;

  constructor() {
    this.priorities = new Map<T, number>();
  }

  setPriority(item: T, value: number): void {
    this.priorities.set(item, value);
  }

  getPriority(item: T): number | undefined {
    return this.priorities.get(item);
  }
}
