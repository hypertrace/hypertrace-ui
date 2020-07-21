export interface Card<T> {
  name: string;
  context: T;
}

export const enum CardType {
  Summary = 'summary'
}
