/* Representação de uma classe que gerencia um sistema de observadores genérico */
export class WatcherSystem<T, U> {
  private watchers: Map<T, U[]>;

  constructor() {
    this.watchers = new Map<T, U[]>();
  }

  watch(target: T, user: U): void {
    if (!this.watchers.has(target)) {
      this.watchers.set(target, [user]);
    } else {
      this.watchers.get(target)!.push(user);
    }
  }

  unwatch(target: T, user: U): void {
    const users = this.watchers.get(target);
    if (users) {
      const index = users.indexOf(user);
      if (index !== -1) {
        users.splice(index, 1);
      }
    }
  }

  getWatchers(target: T): U[] {
    return this.watchers.get(target) ?? [];
  }
}
