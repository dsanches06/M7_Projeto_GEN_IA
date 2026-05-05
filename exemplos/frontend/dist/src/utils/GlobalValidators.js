/* Validadores globais */
export class GlobalValidators {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isNonEmpty(text) {
        return text.trim().length > 0;
    }
    static isPositiveNumber(value) {
        return value > 0;
    }
    static minLength(text, size) {
        return (this.isNonEmpty(text) &&
            this.isPositiveNumber(size) &&
            text.trim().length >= size);
    }
    /* Verifica se o título da tarefa é válido (mínimo de 3 caracteres) */
    static isValidTitle(title) {
        return this.isNonEmpty(title) && this.minLength(title, 3);
    }
}
