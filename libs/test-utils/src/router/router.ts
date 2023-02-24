import { NgZone } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Spectator } from '@ngneat/spectator/jest';

// Purpose of this patch is to make sure navigations always run synchronously and in the ngzone, neither of which is the default
// Not using base spectator directly here as that requires bringing in the non-jest spectator types
export const patchRouterNavigateForTest = (spectator: { inject: Spectator<unknown>['inject'] }) => {
  const router = spectator.inject<Router>(Router);
  const ngZone = spectator.inject<NgZone>(NgZone);
  const originalNavByUrl = router.navigateByUrl.bind(router);

  jest.spyOn(router, 'navigateByUrl').mockImplementation((...args: unknown[]) =>
    ensureRunFakeAsync(() => {
      const returned = ngZone.run(() => originalNavByUrl(...args));
      tick();

      return returned;
    })
  );
};

const ensureRunFakeAsync = <T>(func: () => T): T => {
  const useFakeAsync = !inFakeAsync();

  if (useFakeAsync) {
    return fakeAsync(func)();
  }

  return func();
};

const inFakeAsync = () => {
  try {
    fakeAsync(() => {
      /*NOOP - throws if already in fake async */
    })();

    return false;
  } catch (e) {
    return true;
  }
};
