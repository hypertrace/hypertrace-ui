export interface Card<T> {
  name: string;
  original: T;
}

export const enum CardType {
  Summary = 'summary'
}
