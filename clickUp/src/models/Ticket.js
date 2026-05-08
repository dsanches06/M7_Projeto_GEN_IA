class Ticket {
  constructor(id, userReport, errorType, severity, fixSuggestion, status, createdAt) {
    this.id = id;
    this.userReport = userReport;
    this.errorType = errorType;
    this.severity = severity;
    this.fixSuggestion = fixSuggestion;
    this.status = status;
    this.createdAt = createdAt;
  }

  getId() {
    return this.id;
  }

  getUserReport() {
    return this.userReport;
  }

  getErrorType() {
    return this.errorType;
  }

  getSeverity() {
    return this.severity;
  }

  getFixSuggestion() {
    return this.fixSuggestion;
  }

  getStatus() {
    return this.status;
  }

  getCreatedAt() {
    return this.createdAt;
  }

  setStatus(status) {
    this.status = status;
  }
}

export default Ticket;