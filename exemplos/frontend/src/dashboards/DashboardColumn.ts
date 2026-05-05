export interface DashboardColumn<T> {
  id: string;
  label: string;
  filterFn: (item: T) => boolean;
}
