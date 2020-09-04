import { fakeAsync } from '@angular/core/testing';
import { createDirectiveFactory, SpectatorDirective } from '@ngneat/spectator/jest';
import { EMPTY, Observable, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import { LetAsyncDirective } from './let-async.directive';

describe('Let async directive', () => {
  let spectator: SpectatorDirective<LetAsyncDirective<number>, { data$: Observable<number> }>;

  const createDirective = createDirectiveFactory<LetAsyncDirective<number>, { data$: Observable<number> }>({
    directive: LetAsyncDirective
  });

  beforeEach(() => {
    spectator = createDirective(`
      <div class="content" *htLetAsync="data$ as data">{{ data }}</div>
    `);
  });

  test('updates async values arriving immediately', fakeAsync(() => {
    spectator.setHostInput({ data$: of(5) });
    expect(spectator.query('.content')).toHaveExactText('5');
  }));

  test('updates async values arriving later', fakeAsync(() => {
    spectator.setHostInput({ data$: of(3).pipe(delay(5)) });
    expect(spectator.query('.content')).toHaveExactText('');
    spectator.tick(4); // Not yet updated
    expect(spectator.query('.content')).toHaveExactText('');
    spectator.tick(1); // Now it should update
    expect(spectator.query('.content')).toHaveExactText('3');
  }));

  test('updates from undefined', fakeAsync(() => {
    spectator.setHostInput({ data$: undefined });
    expect(spectator.query('.content')).toHaveExactText('');
  }));

  test('updates multiple values', fakeAsync(() => {
    spectator.setHostInput({ data$: of(3, 4, 5).pipe(concatMap(value => of(value).pipe(delay(1)))) });
    // Start with no value, update to 3, then 4 then 5 at 1 ms intervals
    expect(spectator.query('.content')).toHaveExactText('');
    spectator.tick(1);
    expect(spectator.query('.content')).toHaveExactText('3');
    spectator.tick(1);
    expect(spectator.query('.content')).toHaveExactText('4');
    spectator.tick(1);
    expect(spectator.query('.content')).toHaveExactText('5');
  }));

  test('handles empty observable', () => {
    spectator.setHostInput({ data$: EMPTY });
    expect(spectator.query('.content')).toHaveExactText('');
  });
});
