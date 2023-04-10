/* eslint-disable max-classes-per-file */
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { IconLibraryTestingModule } from '@hypertrace/assets-library';
import { GlobalHeaderHeightProviderService, NavigationService } from '@hypertrace/common';
import { OverlayService, PopoverBackdrop, SheetRef, SheetSize } from '@hypertrace/components';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { OverlayModule } from './overlay.module';
import { SHEET_DATA } from './sheet/sheet';

describe('Overlay service', () => {
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <div class="test-sheet-content">Test Component Content Data: {{ this.data }}</div>
      <button class="test-close-button" (click)="this.onClose()">Close</button>
    `
  })
  class TestComponent {
    public constructor(@Inject(SHEET_DATA) public readonly data: string, public readonly sheetRef: SheetRef) {}

    public onClose(): void {
      this.sheetRef.close(this.data);
    }
  }

  const createHost = createHostFactory({
    component: Component({ selector: 'host', template: 'template' })(class {}),
    declarations: [TestComponent],
    entryComponents: [TestComponent],
    imports: [OverlayModule, IconLibraryTestingModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY
      }),
      mockProvider(GlobalHeaderHeightProviderService, {
        globalHeaderHeight: '56px'
      })
    ],
    template: `<host></host>`
  });

  test('can create a sheet with provided data', fakeAsync(() => {
    const spectator = createHost();
    spectator.inject(OverlayService).createSheet({
      content: TestComponent,
      size: SheetSize.Small,
      title: 'Test title',
      showHeader: true,
      data: 'custom input'
    });

    spectator.tick();

    expect(spectator.query('.test-sheet-content', { root: true })).toContainText(
      'Test Component Content Data: custom input'
    );
    expect(spectator.query('.opaque-backdrop', { root: true })).not.toExist();
    expect(spectator.query('.cdk-overlay-transparent-backdrop', { root: true })).not.toExist();
  }));

  test('sheet can be closed and return a result', fakeAsync(() => {
    const spectator = createHost();
    const sheet: SheetRef<string> = spectator.inject(OverlayService).createSheet({
      content: TestComponent,
      size: SheetSize.Small,
      data: 'custom input'
    });
    let result: string | undefined;
    spectator.tick();
    const subscription = sheet.closed$.subscribe(out => (result = out));
    const closeButton = spectator.query('.test-close-button', { root: true })!;
    expect(result).toBeUndefined();
    expect(subscription.closed).toBe(false);

    spectator.click(closeButton);
    spectator.tick();

    expect(spectator.query('.test-sheet-content', { root: true })).not.toExist();
    expect(result).toBe('custom input');
    expect(subscription.closed).toBe(true);

    flush(); // CDK timer to remove overlay
  }));

  test('can create a sheet that has a backdrop preventing interaction with components outside the sheet', fakeAsync(() => {
    const spectator = createHost();
    spectator.inject(OverlayService).createSheet({
      content: TestComponent,
      size: SheetSize.Small,
      title: 'Test title',
      showHeader: true,
      data: 'custom input',
      backdrop: PopoverBackdrop.Opaque
    });

    spectator.tick();

    expect(spectator.query('.opaque-backdrop', { root: true })).toExist();

    flush();
  }));
});
