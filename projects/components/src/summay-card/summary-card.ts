// Css classes
export const enum SummaryCardColor {
  Red = 'red',
  Brown = 'brown',
  Gray = 'gray',
  Purple = 'purple'
}

export interface SummaryValue {
  value: string;
  icon: string;
  label?: string;
  tooltip?: string;
}
