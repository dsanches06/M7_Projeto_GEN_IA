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
const ENDPOINT = "reminders";
/* Função para obter a lista de lembretes */
export function getReminders(sort, search) {
    return __awaiter(this, void 0, void 0, function* () {
        return get(ENDPOINT, sort, search);
    });
}
/* Função para obter um lembrete por ID */
export function getReminderById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return getById(ENDPOINT, id);
    });
}
/* Função para criar um novo lembrete */
export function createReminder(reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        return create(ENDPOINT, reminder);
    });
}
/* Função para atualizar um lembrete */
export function updateReminder(id, reminder) {
    return __awaiter(this, void 0, void 0, function* () {
        return put(ENDPOINT, id, reminder);
    });
}
/* Função para deletar um lembrete */
export function deleteReminder(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return remove(ENDPOINT, id);
    });
}
