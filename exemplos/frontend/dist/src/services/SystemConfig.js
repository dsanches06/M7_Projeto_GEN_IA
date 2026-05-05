/* Serviço para gerir configurações do sistema */
export class SystemConfig {
    static setEnvironment(env) {
        this.environment = env;
    }
    /* Método para obter informações completas do sistema */
    static getInfo() {
        return `${this.appName} - ${this.version} - ${this.environment}`;
    }
}
