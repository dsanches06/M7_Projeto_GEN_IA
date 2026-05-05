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
const ENDPOINT = "time_logs";
/* Função para obter a lista de registros de tempo */
export function getTimeLogs(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um registro de tempo por ID */
export function getTimeLogById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo registro de tempo */
export function createTimeLog(timeLog) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, timeLog);
    });
}
/* Função para atualizar um registro de tempo */
export function updateTimeLog(id, timeLog) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, timeLog);
    });
}
/* Função para deletar um registro de tempo */
export function deleteTimeLog(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
