import { forkJoin, Observable, of } from 'rxjs';

export type ReplayObservable<T> = Observable<T>;

/**
 * A wrapper around forkjoin that safely returns an empty array for an empty array input.
 * It maintains the normal forkJoin behavior if one provided observable returns EMPTY,
 * which is to return EMPTY as the forkJoin result.
 */
export const forkJoinSafeEmpty = ((input: Parameters<typeof forkJoin>): ReturnType<typeof forkJoin> => {
  if (Array.isArray(input) && input.length === 0) {
    return of([]);
  }

  return forkJoin(input);
}) as typeof forkJoin;
