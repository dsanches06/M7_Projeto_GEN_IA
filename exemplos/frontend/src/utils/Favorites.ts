import { EntityList } from "./index.js";

/* Representação de uma classe que gerencia uma lista de favoritos genéricos */
export class Favorites<T> {
  private entityList: EntityList<T>;

  constructor() {
    this.entityList = new EntityList<T>();
  }

  add(item: T): void {
    this.entityList.add(item);
  }

  getAll(): T[] {
    return this.entityList.getAll();
  }

  remove(item: T): void {
    // Remove todas as ocorrências do item
    const arr = this.getAll();
    let index = arr.indexOf(item);
    while (index !== -1) {
      arr.splice(index, 1);
      index = arr.indexOf(item);
    }
  }

  exists(item: T): boolean {
    return this.getAll().includes(item);
  }
}
