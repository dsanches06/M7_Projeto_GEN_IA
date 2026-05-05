/* Representação de uma classe que gerencia uma lista de entidades genéricas */
export class EntityList {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
    }
    getAll() {
        return this.items;
    }
}
