import { forkJoin, Observable, of } from 'rxjs';

export type ReplayObservable<T> = Observable<T>;

/**
 * A wrapper around forkjoin that safely returns an empty array for an empty array input.
 * It maintains the normal forkJoin behavior if one provided observable returns EMPTY,
 * which is to return EMPTY as the forkJoin result.
 */
// tslint:disable-next-line: deprecation
export const forkJoinSafeEmpty = ((input: Parameters<typeof forkJoin>): ReturnType<typeof forkJoin> => {
  if (Array.isArray(input) && input.length === 0) {
    return of([]);
  }

  // tslint:disable-next-line: ban
  return forkJoin(input);
  // tslint:disable-next-line: deprecation
}) as typeof forkJoin;
