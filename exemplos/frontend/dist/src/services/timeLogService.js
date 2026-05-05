var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchTimeLogs from "../api/fetchTimeLogs.js";
/* Serviço para gerenciar registos de tempo */
export class TimeLogService {
    /* Função para obter a lista de registos de tempo */
    static getTimeLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTimeLogs.getTimeLogs();
        });
    }
    /* Função para obter um registo de tempo por ID */
    static getTimeLogById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTimeLogs.getTimeLogById(id);
        });
    }
    /* Função para criar um novo registo de tempo */
    static createTimeLog(timeLog) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTimeLogs.createTimeLog(timeLog);
        });
    }
    /* Função para atualizar um registo de tempo existente */
    static updateTimeLog(id, timeLog) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTimeLogs.updateTimeLog(id, timeLog);
        });
    }
    /* Função para excluir um registo de tempo */
    static deleteTimeLog(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchTimeLogs.deleteTimeLog(id);
        });
    }
}
