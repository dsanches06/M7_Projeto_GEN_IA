/* Representação de uma classe que gerencia um sistema de observadores genérico */
export class WatcherSystem {
    constructor() {
        this.watchers = new Map();
    }
    watch(target, user) {
        if (!this.watchers.has(target)) {
            this.watchers.set(target, [user]);
        }
        else {
            this.watchers.get(target).push(user);
        }
    }
    unwatch(target, user) {
        const users = this.watchers.get(target);
        if (users) {
            const index = users.indexOf(user);
            if (index !== -1) {
                users.splice(index, 1);
            }
        }
    }
    getWatchers(target) {
        var _a;
        return (_a = this.watchers.get(target)) !== null && _a !== void 0 ? _a : [];
    }
}
