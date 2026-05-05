/* Representação de uma classe que gerencia uma lista de entidades genéricas */
export class EntityList<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return this.items;
  }
}
