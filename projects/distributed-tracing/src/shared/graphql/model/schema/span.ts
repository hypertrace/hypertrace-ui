export const SPAN_SCOPE = 'SPAN';
export const spanIdKey = Symbol('spanIdKey');
export const type = Symbol('type');

export const enum SpanType {
  Entry = 'ENTRY',
  Exit = 'EXIT',
  Internal = 'INTERNAL'
}

export interface Span {
  [key: string]: unknown;
  [spanIdKey]: string;
}
