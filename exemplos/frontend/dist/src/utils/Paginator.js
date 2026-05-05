/* Representação de uma classe que gerencia a paginação de uma lista genérica */
export class Paginator {
    paginate(items, page, size) {
        if (page < 1 || size < 1)
            return [];
        const startIndex = (page - 1) * size;
        if (startIndex >= items.length)
            return [];
        const endIndex = startIndex + size;
        return items.slice(startIndex, endIndex);
    }
}
