/* Representação de uma classe que gerencia um cache simples genérico */
export class SimpleCache<K, T> {
  private cache: Map<K, T>;

  constructor() {
    this.cache = new Map<K, T>();
  }

  set(key: K, value: T) {
    this.cache.set(key, value);
  }

  get(key: K): T | undefined {
    return this.cache.get(key);
  }
}
