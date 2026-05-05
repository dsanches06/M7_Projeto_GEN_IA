var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UserService, TaskService } from "./index.js";
/* Serviço para backup de dados */
export class BackupService {
    exportUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.stringify(yield UserService.getUsers());
        });
    }
    exportTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            return JSON.stringify(yield TaskService.getTasks());
        });
    }
    exportAssignments() {
        return __awaiter(this, void 0, void 0, function* () {
            const assignments = (yield TaskService.getTasks()).map((task) => {
                var _a, _b, _c;
                return ({
                    taskId: task.getId(),
                    assignedTo: (_c = (_b = (_a = task.getAssignees) === null || _a === void 0 ? void 0 : _a.call(task)[0]) === null || _b === void 0 ? void 0 : _b.user_id) !== null && _c !== void 0 ? _c : null,
                });
            });
            return JSON.stringify(assignments);
        });
    }
    exportAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                users: yield this.exportUsers(),
                tasks: yield this.exportTasks(),
                assignments: yield this.exportAssignments(),
            };
        });
    }
}
