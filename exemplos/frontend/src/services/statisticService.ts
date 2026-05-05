import * as fetchstatistics from "../api/index.js";
import {
  RankingAboveAverageDTORequest,
  RankingIncreaseHoursDTORequest,
  RankingMoreHoursDTORequest,
} from "../api/dto/index.js";

export class StatisticsService {

  /* Função para obter ranking com mais horas */
  async getRankingMoreHours(): Promise<RankingMoreHoursDTORequest[]> {
    return fetchstatistics.getRankingMoreHours();
  }

  /* Função para obter ranking com horas aumentadas */
  async getRankingIncreasedHours(): Promise<RankingIncreaseHoursDTORequest[]> {
    return fetchstatistics.getRankingIncreasedHours();
  }

  /* Função para obter ranking acima da média */
  async getRankingAboveAverage(): Promise<RankingAboveAverageDTORequest[]> {
    return fetchstatistics.getRankingAboveAverage();
  }
}

