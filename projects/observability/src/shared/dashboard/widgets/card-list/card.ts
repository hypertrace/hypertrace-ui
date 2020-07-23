export interface Card<T = unknown> {
  name: string;
  context: T;
}

export const enum CardType {
  Summary = 'summary'
}
