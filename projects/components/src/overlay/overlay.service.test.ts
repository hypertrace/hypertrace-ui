import { Component } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createServiceFactory, mockProvider, SpectatorService } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { PopoverModule } from '../popover/popover.module';
import { ModalSize } from './modal/modal';
import { OverlayService } from './overlay.service';
import { SheetSize } from './sheet/sheet';

describe('Overlay service', () => {
  const navigation$: Subject<void> = new Subject<void>();

  let spectator: SpectatorService<OverlayService>;

  const createService = createServiceFactory({
    service: OverlayService,
    imports: [PopoverModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: navigation$
      })
    ]
  });

  beforeEach(() => {
    spectator = createService();
  });

  test('can close a sheet popover on navigation', fakeAsync(() => {
    const popover = spectator.service.createSheet({
      showHeader: false,
      size: SheetSize.Medium,
      content: Component({
        selector: 'test-component',
        template: `<div>TEST</div>`
      })(class {})
    });
    popover.show();
    popover.closeOnNavigation();
    tick(); // CDK overlay is async

    expect(popover.closed).toBe(false);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      navigation$.next();
    });

    expect(popover.closed).toBe(true);
    flush(); // CDK cleans up overlay async
  }));

  test('can close a modal popover on navigation', fakeAsync(() => {
    const popover = spectator.service.createModal({
      showHeader: false,
      size: ModalSize.Small,
      content: Component({
        selector: 'test-component',
        template: `<div>TEST</div>`
      })(class {})
    });
    popover.show();
    popover.closeOnNavigation();
    tick(); // CDK overlay is async

    expect(popover.closed).toBe(false);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      navigation$.next();
    });

    expect(popover.closed).toBe(true);
    flush(); // CDK cleans up overlay async
  }));
});
