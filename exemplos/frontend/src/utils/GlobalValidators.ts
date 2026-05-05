/* Validadores globais */
export class GlobalValidators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isNonEmpty(text: string): boolean {
    return text.trim().length > 0;
  }

  static isPositiveNumber(value: number): boolean {
    return value > 0;
  }

  static minLength(text: string, size: number): boolean {
    return (
      this.isNonEmpty(text) &&
      this.isPositiveNumber(size) &&
      text.trim().length >= size
    );
  }

  /* Verifica se o título da tarefa é válido (mínimo de 3 caracteres) */
  static isValidTitle(title: string): boolean {
    return this.isNonEmpty(title) && this.minLength(title, 3);
  }
}
