/* Representação de um grafo de dependências genérico */
export class DependencyGraph {
    constructor() {
        this.graph = new Map();
    }
    addDependency(item, dependsOn) {
        if (!this.graph.has(item)) {
            this.graph.set(item, []);
        }
        this.graph.get(item).push(dependsOn);
    }
    getDependencies(item) {
        return this.graph.get(item) || [];
    }
    hasDependencies(item) {
        return this.graph.has(item) && this.graph.get(item).length > 0;
    }
}
