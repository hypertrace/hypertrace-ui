// tslint:disable:no-any

// Long story, but standard Omit does not distribute across union types.
// Below code taken from https://github.com/Microsoft/TypeScript/issues/28339
type UnionKeys<T> = T extends any ? keyof T : never;
export type DistributiveOmit<T, K extends UnionKeys<T>> = T extends any ? Omit<T, Extract<keyof T, K>> : never;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type KeysWithType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export interface Dictionary<T> {
  [key: string]: T;
}

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R> // tslint:disable-next-line: ban-types
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export interface Json {
  [key: string]: JsonValue;
}

export type JsonValue = Json | Json[] | string | number | boolean | null;
export type PrimitiveValue = string | number | boolean;
