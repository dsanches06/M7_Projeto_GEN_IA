import { TaskStatus } from "../../tasks/TaskStatus.js";
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
export function generateTeamColors(teams) {
    return teams.map((team, index) => {
        var _a;
        return ({
            name: ((_a = team.getName) === null || _a === void 0 ? void 0 : _a.call(team)) || team.name || `Team ${index + 1}`,
            color: DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        });
    });
}
/** Converter status numérico para booleano */
export function getStatus(status) {
    return status === 1 ? true : false;
}
/* Função auxiliar para converter data seguramente */
export function parseDate(date) {
    if (date instanceof Date) {
        return date;
    }
    if (typeof date === "string") {
        return new Date(date);
    }
    return new Date();
}
export function formatDate(dateValue) {
    if (!dateValue)
        return "Data não definida";
    try {
        const date = new Date(dateValue);
        return isNaN(date.getTime())
            ? "Data inválida"
            : date.toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
    }
    catch (_a) {
        return "Data inválida";
    }
}
/** Converter status_id para TaskStatus enum */
export function getTaskStatusFromId(statusId) {
    const statusMap = {
        1: TaskStatus.CREATED,
        2: TaskStatus.ASSIGNED,
        3: TaskStatus.IN_PROGRESS,
        4: TaskStatus.BLOCKED,
        5: TaskStatus.COMPLETED,
        6: TaskStatus.ARCHIVED,
    };
    return statusMap[statusId] || TaskStatus.CREATED;
}
