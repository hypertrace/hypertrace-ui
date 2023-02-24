import { Component } from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { recordObservable, runFakeRxjs } from '@hypertrace/test-utils';
import { createHostFactory, mockProvider, SpectatorHost } from '@ngneat/spectator/jest';
import { Subject } from 'rxjs';
import { PopoverBackdrop, PopoverPositionType, PopoverRelativePositionLocation } from './popover';
import { PopoverModule } from './popover.module';
import { PopoverService } from './popover.service';

describe('Popover service', () => {
  const navigation$: Subject<void> = new Subject<void>();

  let spectator: SpectatorHost<object>;
  let service: PopoverService;
  const testContent = Component({
    selector: 'popover-test-content',
    template: 'Test content'
  })(class {});

  const popoverHostFactory = createHostFactory({
    component: Component({
      selector: 'popover-parent',
      template: '<div></div>'
    })(class {}),
    imports: [PopoverModule],
    entryComponents: [testContent],
    declarations: [testContent],
    providers: [
      mockProvider(NavigationService, {
        navigation$: navigation$
      })
    ]
  });

  const popoverContent = () => spectator.query('popover-test-content', { root: true })!;
  const popoverBackdrop = (backdrop: PopoverBackdrop) => {
    switch (backdrop) {
      case PopoverBackdrop.Transparent:
        return spectator.query('.cdk-overlay-transparent-backdrop', { root: true })!;
      case PopoverBackdrop.Opaque:
        return spectator.query('.opaque-backdrop', { root: true })!;
      case PopoverBackdrop.None:
      default:
        return undefined;
    }
  };

  beforeEach(() => {
    spectator = popoverHostFactory(`<popover-parent></popover-parent>`);
    service = spectator.inject(PopoverService);
  });

  test('can open a basic popover', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      componentOrTemplate: testContent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    expect(popoverContent()).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Opaque)).not.toExist();
    expect(popoverBackdrop(PopoverBackdrop.Transparent)).not.toExist();
    popover.close();
  }));

  test('can open a basic popover, left aligned over the trigger element', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.OverLeftAligned]
      },
      componentOrTemplate: testContent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    expect(popoverContent()).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Opaque)).not.toExist();
    expect(popoverBackdrop(PopoverBackdrop.Transparent)).not.toExist();
    popover.close();
  }));

  test('can open a basic popover with transparent backdrop', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      componentOrTemplate: testContent,
      backdrop: PopoverBackdrop.Transparent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    expect(popoverContent()).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Transparent)).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Opaque)).not.toExist();
    popover.close();
    flush();
  }));

  test('can open a basic popover with opaque backdrop', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      componentOrTemplate: testContent,
      backdrop: PopoverBackdrop.Opaque
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    expect(popoverContent()).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Opaque)).toExist();
    expect(popoverBackdrop(PopoverBackdrop.Transparent)).not.toExist();
    popover.close();
    flush();
  }));

  test('can close a popover on navigation', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      backdrop: PopoverBackdrop.Transparent,
      componentOrTemplate: testContent
    });
    popover.show();
    popover.closeOnNavigation();

    tick(); // CDK overlay is async
    spectator.detectChanges();

    expect(popover.closed).toBe(false);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      navigation$.next();
    });

    expect(popover.closed).toBe(true);
    expect(popoverContent()).not.toExist();
    flush(); // CDK cleans up overlay async
    popover.close();
  }));

  test('can close a popover on backdrop click', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      backdrop: PopoverBackdrop.Transparent,
      componentOrTemplate: testContent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    popover.closeOnBackdropClick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      spectator.click(popoverBackdrop(PopoverBackdrop.Transparent));
    });

    expect(popover.closed).toBe(true);
    expect(popoverContent()).not.toExist();
    flush(); // CDK cleans up overlay async
    popover.close();
  }));

  test('can hide a popover on backdrop click', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      backdrop: PopoverBackdrop.Transparent,
      componentOrTemplate: testContent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();
    const unsubscribe = popover.hideOnBackdropClick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe(''); // Still open, no events
      expectObservable(recordObservable(popover.hidden$)).toBe('x', { x: undefined });
      expectObservable(recordObservable(popover.shown$)).toBe('');
      spectator.click(popoverBackdrop(PopoverBackdrop.Transparent));
    });

    expect(popoverContent()).not.toExist(); // Not visible
    expect(popover.closed).toBe(false);

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe(''); // Still open, no events
      expectObservable(recordObservable(popover.hidden$)).toBe('');
      expectObservable(recordObservable(popover.shown$)).toBe('x', { x: undefined });

      popover.show();
    });

    tick(); // CDK overlay is async
    spectator.detectChanges();
    expect(popoverContent()).toExist(); // Not visible
    expect(popover.closed).toBe(false);

    unsubscribe(); // Disale backdrop click listener

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe(''); // Still open, no events
      expectObservable(recordObservable(popover.hidden$)).toBe('');
      expectObservable(recordObservable(popover.shown$)).toBe('');
      spectator.click(popoverBackdrop(PopoverBackdrop.Transparent));
    });

    popover.close();
    flush();
    popover.close();
  }));

  test('can close a popover on content click', fakeAsync(() => {
    const popover = service.drawPopover({
      position: {
        type: PopoverPositionType.Relative,
        origin: spectator.debugElement,
        locationPreferences: [PopoverRelativePositionLocation.InsideTopLeft]
      },
      componentOrTemplate: testContent
    });
    tick(); // CDK overlay is async
    spectator.detectChanges();

    popover.closeOnPopoverContentClick();

    runFakeRxjs(({ expectObservable }) => {
      expectObservable(popover.closed$).toBe('(x|)', { x: undefined });
      expectObservable(recordObservable(popover.hidden$)).toBe('|'); // Record hidden/shown for test, since they're hot
      expectObservable(recordObservable(popover.shown$)).toBe('|');
      spectator.click(popoverContent());
    });

    expect(popover.closed).toBe(true);
    expect(popoverContent()).not.toExist();
    flush(); // CDK cleans up overlay async
    popover.close();
  }));
});
