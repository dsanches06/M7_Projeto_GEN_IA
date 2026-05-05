import { TaskStatus } from "../tasks/TaskStatus.js";
/* Representação de transições de estado */
export class StateTransitions {
    static validTransitions(current, next) {
        const allowed = this.TRANSITIONS[current] || [];
        return allowed.includes(next);
    }
    static getNextStatus(status) {
        const t = Object.keys(TaskStatus).map((key) => TaskStatus[key]);
        const currentIndex = t.indexOf(status);
        const nextIndex = currentIndex + 1;
        return nextIndex < t.length ? t[nextIndex] : status;
    }
}
StateTransitions.TRANSITIONS = {
    [TaskStatus.CREATED]: [TaskStatus.ASSIGNED, TaskStatus.BLOCKED],
    [TaskStatus.ASSIGNED]: [
        TaskStatus.CREATED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.BLOCKED,
    ],
    [TaskStatus.IN_PROGRESS]: [
        TaskStatus.CREATED,
        TaskStatus.ASSIGNED,
        TaskStatus.COMPLETED,
        TaskStatus.BLOCKED,
    ],
    [TaskStatus.BLOCKED]: [
        TaskStatus.CREATED,
        TaskStatus.ASSIGNED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.COMPLETED,
        TaskStatus.ARCHIVED,
    ],
    [TaskStatus.COMPLETED]: [TaskStatus.ARCHIVED],
    [TaskStatus.ARCHIVED]: [],
};
