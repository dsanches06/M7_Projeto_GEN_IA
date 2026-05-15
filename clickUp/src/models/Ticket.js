// Modelo de dados para um ticket de suporte
class Ticket {
  constructor(id, userReport, errorType, severity, fixSuggestion, status, createdAt) {
    this.id = id;
    this.userReport = userReport;
    this.errorType = errorType;
    // Nível de severidade de 1 a 10
    this.severity = severity;
    this.fixSuggestion = fixSuggestion;
    // Estado actual do ticket (ex: open, in_progress, resolved, closed)
    this.status = status;
    this.createdAt = createdAt;
  }

  // Devolve o ID do ticket
  getId() {
    return this.id;
  }

  // Devolve a descrição do problema reportado
  getUserReport() {
    return this.userReport;
  }

  // Devolve o tipo de erro
  getErrorType() {
    return this.errorType;
  }

  // Devolve o nível de severidade
  getSeverity() {
    return this.severity;
  }

  // Devolve a sugestão de correcção
  getFixSuggestion() {
    return this.fixSuggestion;
  }

  // Devolve o estado actual
  getStatus() {
    return this.status;
  }

  // Devolve a data de criação
  getCreatedAt() {
    return this.createdAt;
  }

  // Actualiza o estado do ticket
  setStatus(status) {
    this.status = status;
  }
}

export default Ticket;
