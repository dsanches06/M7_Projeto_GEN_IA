var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fetchstatistics from "../api/index.js";
export class StatisticsService {
    /* Função para obter ranking com mais horas */
    getRankingMoreHours() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetchstatistics.getRankingMoreHours();
        });
    }
    /* Função para obter ranking com horas aumentadas */
    getRankingIncreasedHours() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetchstatistics.getRankingIncreasedHours();
        });
    }
    /* Função para obter ranking acima da média */
    getRankingAboveAverage() {
        return __awaiter(this, void 0, void 0, function* () {
            return fetchstatistics.getRankingAboveAverage();
        });
    }
}
