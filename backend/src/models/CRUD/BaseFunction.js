// ======================================================
// FILE: base_function.js
// ======================================================

import { Type } from "@google/genai";

/**
 * Classe Base para Functions do Gemini
 * Reutilizável para:
 * - tasks
 * - notifications
 * - comments
 * - tickets
 * - users
 * - etc
 */
export class BaseFunction {
  constructor({ functionName, description, properties = {}, required = [] }) {
    this.functionName = functionName;
    this.description = description;
    this.properties = properties;
    this.required = required;
  }

  // ======================================================
  // DECLARATION
  // ======================================================

  getDeclaration() {
    return {
      name: this.functionName,
      description: this.description,

      parameters: {
        type: Type.OBJECT,

        properties: this.properties,

        required: this.required,
      },
    };
  }

  // ======================================================
  // HELPERS
  // ======================================================

  parseNumber(value, fallback = 0) {
    if (value === undefined || value === null || value === "") {
      return fallback;
    }

    const number = Number(value);

    return Number.isNaN(number) ? fallback : number;
  }

  parseBoolean(value, fallback = false) {
    if (value === undefined || value === null) {
      return fallback;
    }

    if (typeof value === "boolean") {
      return value;
    }

    return value === "true" || value === "1" || value === 1;
  }

  parseString(value, fallback = "") {
    if (value === undefined || value === null) {
      return fallback;
    }

    return value.toString().trim();
  }

  parseDate(value, fallback = null) {
    return value || fallback;
  }

  currentDate() {
    return new Date().toISOString();
  }

  /**
   * Método que será sobrescrito
   * (POLIMORFISMO)
   */
  mapValues() {
    throw new Error("mapValues() deve ser implementado.");
  }

  execute(args = {}) {
    return this.mapValues(args);
  }
}
