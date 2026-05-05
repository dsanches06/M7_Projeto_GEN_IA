import { get } from "./index.js";
import {
  RankingAboveAverageDTORequest,
  RankingIncreaseHoursDTORequest,
  RankingMoreHoursDTORequest,
} from "./dto/index.js";

const ENDPOINT = "statistics/ranking";

/* Função para obter ranking com mais horas */
export async function getRankingMoreHours(): Promise<
  RankingMoreHoursDTORequest[]
> {
  return get<RankingMoreHoursDTORequest>(`${ENDPOINT}/morehours`);
}

/* Função para obter ranking com horas aumentadas */
export async function getRankingIncreasedHours(): Promise<
  RankingIncreaseHoursDTORequest[]
> {
  return get<RankingIncreaseHoursDTORequest>(`${ENDPOINT}/increasedhours`);
}

/* Função para obter ranking acima da média */
export async function getRankingAboveAverage(): Promise<
  RankingAboveAverageDTORequest[]
> {
  return get<RankingAboveAverageDTORequest>(`${ENDPOINT}/aboveaverage`);
}

