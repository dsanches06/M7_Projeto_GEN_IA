/* Representação de uma entidade base */
export class BaseEntity {
    constructor(id) {
        this.id = id;
        this.createdAt = new Date();
        BaseEntity.totalEntities += 1;
    }
    getId() {
        return this.id;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    static getTotalEntities() {
        return this.totalEntities;
    }
}
BaseEntity.totalEntities = 0;
