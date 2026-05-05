import { DashboardColumn } from "./DashboardColumn.js";

export interface DashboardConfig<T> {
  containerId: string;
  columns: DashboardColumn<T>[];
  cardRenderer: (item: T) => HTMLElement;
  onCardClick?: (item: T, event: MouseEvent) => void;
  itemId: (item: T) => string | number;
  itemGroupKey: (item: T) => string;
}
