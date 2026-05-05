/* Representação de um sistema de classificação genérico */
export class RatingSystem {
    constructor() {
        this.ratings = new Map();
    }
    rate(item, value) {
        var _a;
        if (!this.ratings.has(item)) {
            this.ratings.set(item, []);
        }
        (_a = this.ratings.get(item)) === null || _a === void 0 ? void 0 : _a.push(value);
    }
    getAverage(item) {
        const itemRatings = this.getRatings(item);
        if (itemRatings.length === 0) {
            return 0;
        }
        const sum = itemRatings.reduce((acc, val) => acc + val, 0);
        return sum / itemRatings.length;
    }
    getRatings(item) {
        return this.ratings.get(item) || [];
    }
}
