var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { get } from "./index.js";
const ENDPOINT = "statistics/ranking";
/* Função para obter ranking com mais horas */
export function getRankingMoreHours() {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/morehours`);
    });
}
/* Função para obter ranking com horas aumentadas */
export function getRankingIncreasedHours() {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/increasedhours`);
    });
}
/* Função para obter ranking acima da média */
export function getRankingAboveAverage() {
    return __awaiter(this, void 0, void 0, function* () {
        return get(`${ENDPOINT}/aboveaverage`);
    });
}
