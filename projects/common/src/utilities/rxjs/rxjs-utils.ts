/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  no-redeclare */

import { forkJoin, Observable, ObservableInput, ObservableInputTuple, ObservedValueOf, of } from 'rxjs';

export type ReplayObservable<T> = Observable<T>;

export function forkJoinSafeEmpty(sourcesObject: { [K in any]: never } | readonly []): Observable<never>;

// forkJoin({a, b, c})
export function forkJoinSafeEmpty<T extends Record<string, ObservableInput<any>>>(
  sourcesObject: T
): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;

// forkJoin([a, b, c])
export function forkJoinSafeEmpty<A extends readonly unknown[]>(
  sources: readonly [...ObservableInputTuple<A>]
): Observable<A>;
export function forkJoinSafeEmpty<A extends readonly unknown[], R>(
  sources: readonly [...ObservableInputTuple<A>],
  resultSelector: (...values: A) => R
): Observable<R>;

export function forkJoinSafeEmpty(...args: any[]): Observable<any> {
  if (Array.isArray(args) && args.length === 0) {
    return of([]);
  }

  return forkJoin(args);
}
