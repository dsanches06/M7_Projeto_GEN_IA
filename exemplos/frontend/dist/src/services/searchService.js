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
/* Serviço para realizar buscas em tarefas e usuários */
export class SearchService {
    constructor() { }
    searchByTitle(text) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield TaskService.getTasks()).filter((task) => task.getTitle().includes(text));
        });
    }
    searchByUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield UserService.getUserById(userId);
        });
    }
    searchByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (yield TaskService.getTasks()).filter((task) => task.getStatus() === status);
        });
    }
    globalSearch(query) {
        let results = [];
        if (query.title) {
            results = results.concat(this.searchByTitle(query.title));
        }
        if (query.userId) {
            results = results.concat(this.searchByUser(query.userId));
        }
        if (query.status) {
            results = results.concat(this.searchByStatus(query.status));
        }
        const uniqueIds = new Set();
        const uniqueResults = results.filter((item) => {
            const id = item.getId();
            if (!uniqueIds.has(id)) {
                uniqueIds.add(id);
            }
        });
        return uniqueResults;
    }
}
