/* Enumerados de status de tarefas */
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["CREATED"] = "CREATED";
    TaskStatus["ASSIGNED"] = "ASSIGNED";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["BLOCKED"] = "BLOCKED";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["ARCHIVED"] = "ARCHIVED";
})(TaskStatus || (TaskStatus = {}));
