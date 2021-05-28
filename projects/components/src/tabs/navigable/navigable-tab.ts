export interface NavigableTab {
  path: string;
  label: string;
  hidden?: boolean;
  features?: string[];
  replaceHistory?: boolean;
}
