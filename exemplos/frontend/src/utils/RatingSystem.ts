/* Representação de um sistema de classificação genérico */
export class RatingSystem<T> {
  private ratings: Map<T, number[]>;

  constructor() {
    this.ratings = new Map<T, number[]>();
  }

  rate(item: T, value: number): void {
    if (!this.ratings.has(item)) {
      this.ratings.set(item, []);
    }
    this.ratings.get(item)?.push(value);
  }

  getAverage(item: T): number {
    const itemRatings = this.getRatings(item);
    if (itemRatings.length === 0) {
      return 0;
    }
    const sum = itemRatings.reduce((acc, val) => acc + val, 0);
    return sum / itemRatings.length;
  }

  getRatings(item: T): number[] {
    return this.ratings.get(item) || [];
  }
}
