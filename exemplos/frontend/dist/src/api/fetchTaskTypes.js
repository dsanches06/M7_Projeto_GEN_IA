var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get, getById, create, put, remove } from "./index.js";
const ENDPOINT = "task_types";
export function getTaskTypes() {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT);
    });
}
export function getTaskTypeById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
export function createTaskType(taskType) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, taskType);
    });
}
export function updateTaskType(id, taskType) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, taskType);
    });
}
export function deleteTaskType(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
