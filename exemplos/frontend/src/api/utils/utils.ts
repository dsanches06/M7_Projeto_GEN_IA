import { TaskStatus } from "../../tasks/TaskStatus.js";

export interface LegendItem {
  name: string;
  color: string;
}

export interface ActivityBar {
  label: string;
  name: string;
  start: number;
  duration: number;
  color: string;
}

export interface GanttTask {
  name: string;
  activities: ActivityBar[];
}

// =======================
// CORES
// =======================
export const DEFAULT_COLORS = [
  "#e6a38a",
  "#d97b7b",
  "#9b6c7a",
  "#5c5366",
  "#6d8199",
  "#4f6a7a",
  "#8b7355",
  "#a073a6",
];


/**
 * Gera cores para os times carregados da API
 */
export function generateTeamColors(teams: any[]): LegendItem[] {
  return teams.map((team: any, index: number) => ({
    name: team.getName?.() || team.name || `Team ${index + 1}`,
    color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));
}

/** Converter status numérico para booleano */
export function getStatus(status: number): boolean {
  return status === 1 ? true : false;
}

/* Função auxiliar para converter data seguramente */
export function parseDate(date: any): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === "string") {
    return new Date(date);
  }
  return new Date();
}

export function formatDate(dateValue: any): string {
  if (!dateValue) return "Data não definida";
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime())
      ? "Data inválida"
      : date.toLocaleDateString("pt-PT", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  } catch {
    return "Data inválida";
  }
}

/** Converter status_id para TaskStatus enum */
export function getTaskStatusFromId(statusId: number): TaskStatus {
  const statusMap: { [key: number]: TaskStatus } = {
    1: TaskStatus.CREATED,
    2: TaskStatus.ASSIGNED,
    3: TaskStatus.IN_PROGRESS,
    4: TaskStatus.BLOCKED,
    5: TaskStatus.COMPLETED,
    6: TaskStatus.ARCHIVED,
  };
  return statusMap[statusId] || TaskStatus.CREATED;
}
