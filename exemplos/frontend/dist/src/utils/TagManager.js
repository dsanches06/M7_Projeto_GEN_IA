/* Representação de uma classe que gerencia tags associadas a itens genéricos */
export class TagManager {
    constructor() {
        this.tagsToTask = new Map();
    }
    addTag(item, tag) {
        var _a;
        if (!this.tagsToTask.has(item)) {
            this.tagsToTask.set(item, []);
        }
        (_a = this.tagsToTask.get(item)) === null || _a === void 0 ? void 0 : _a.push(tag);
    }
    removeTag(item, tag) {
        const tags = this.tagsToTask.get(item) || [];
        const filteredTags = tags.filter((t) => t !== tag);
        this.tagsToTask.set(item, filteredTags);
    }
    getTags(item) {
        return this.tagsToTask.get(item) || [];
    }
}
