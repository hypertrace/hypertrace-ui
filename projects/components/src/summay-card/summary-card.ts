// Css classes
export const enum SummaryCardColor {
  Red = 'red',
  Brown = 'brown',
  Gray = 'gray'
}

export interface SummaryValue {
  value: string;
  icon: string;
  label?: string;
  tooltip?: string;
}
