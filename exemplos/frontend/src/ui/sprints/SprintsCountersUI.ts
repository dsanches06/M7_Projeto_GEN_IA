import { SprintService } from "../../services/index.js";
import { SprintStatsDTORequest } from "../../api/dto/index.js";

export interface SprintStatsResponse {
  totalSprints: number;
}

export async function showSprintsCounters(
  type?: string,
  sprints?: any[],
): Promise<void> {
  if (type === "filtrados" && sprints) {
    await countAllSprints("#allSprintsCounter", sprints.length);
    countFilterSprints("#filterSprintsCounter", type!, sprints.length);
  } else {
    await countAllSprints("#allSprintsCounter");
    countFilterSprints("#filterSprintsCounter", type!);
  }
}

/* Contador de sprints filtrados */
function countFilterSprints(id: string, type: string, count?: number): void {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (section) {
    if (count !== undefined) {
      section.textContent = `${count}`;
    } else {
      section.textContent = "0";
    }
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}

/* Contador de todos os sprints */
async function countAllSprints(
  id: string,
  overrideValue?: number,
): Promise<void> {
  const section = document.querySelector(`${id}`) as HTMLElement;
  if (overrideValue !== undefined) {
    if (section) {
      section.textContent = `${overrideValue}`;
    }
    return;
  }
  const stats: SprintStatsDTORequest = (await SprintService.getSprintsStats())!;
  if (section) {
    section.textContent = `${stats.totalSprints}`;
  } else {
    console.warn(`Elemento ${id} não foi encontrado no DOM.`);
  }
}
