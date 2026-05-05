/* Representação de um grafo de dependências genérico */
export class DependencyGraph<T> {
  private graph: Map<T, T[]>;

  constructor() {
    this.graph = new Map<T, T[]>();
  }

  addDependency(item: T, dependsOn: T): void {
    if (!this.graph.has(item)) {
      this.graph.set(item, []);
    }
    this.graph.get(item)!.push(dependsOn);
  }

  getDependencies(item: T): T[] {
    return this.graph.get(item) || [];
  }

  hasDependencies(item: T): boolean {
    return this.graph.has(item) && this.graph.get(item)!.length > 0;
  }
}
