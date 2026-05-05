import { EntityList } from "./index.js";
/* Representação de uma classe que gerencia uma lista de favoritos genéricos */
export class Favorites {
    constructor() {
        this.entityList = new EntityList();
    }
    add(item) {
        this.entityList.add(item);
    }
    getAll() {
        return this.entityList.getAll();
    }
    remove(item) {
        // Remove todas as ocorrências do item
        const arr = this.getAll();
        let index = arr.indexOf(item);
        while (index !== -1) {
            arr.splice(index, 1);
            index = arr.indexOf(item);
        }
    }
    exists(item) {
        return this.getAll().includes(item);
    }
}
