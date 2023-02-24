import { Observable, ReplaySubject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

type RxjsRunHelpers = Parameters<TestScheduler['run']>[0];

export const runFakeRxjs = (runFn: RxjsRunHelpers): void => {
  new TestScheduler((actual: unknown, expected: unknown) => {
    expect(actual).toEqual(expected);
  }).run(runFn);
};

export const recordObservable = <T>(observable: Observable<T>): Observable<T> => {
  const replay = new ReplaySubject<T>();
  observable.subscribe(replay);

  return replay.asObservable();
};

export const expectSingleEmissisonFromCallback = <T>(
  observable: Observable<T>,
  callback: () => void,
  match?: unknown
): void => {
  runFakeRxjs(({ expectObservable }) => {
    const recorded = recordObservable(observable);
    callback();
    expectObservable(recorded).toBe('x', { x: match });
  });
};
