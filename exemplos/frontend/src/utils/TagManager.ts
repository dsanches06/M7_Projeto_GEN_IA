/* Representação de uma classe que gerencia tags associadas a itens genéricos */
export class TagManager<T> {
  private tagsToTask: Map<T, string[]>;

  constructor() {
    this.tagsToTask = new Map<T, string[]>();
  }

  addTag(item: T, tag: string): void {
    if (!this.tagsToTask.has(item)) {
      this.tagsToTask.set(item, []);
    }
    this.tagsToTask.get(item)?.push(tag);
  }

  removeTag(item: T, tag: string): void {
    const tags = this.tagsToTask.get(item) || [];
    const filteredTags = tags.filter((t) => t !== tag);
    this.tagsToTask.set(item, filteredTags);
  }

  getTags(item: T): string[] {
    return this.tagsToTask.get(item) || [];
  }
}
