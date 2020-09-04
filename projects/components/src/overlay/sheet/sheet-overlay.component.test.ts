import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GLOBAL_HEADER_HEIGHT, NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ButtonModule } from '../../button/button.module';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetSize } from './sheet';
import { SheetOverlayComponent } from './sheet-overlay.component';

// tslint:disable-next-line:component-selector
@Component({
  selector: 'test-sheet-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="test-modal-content">Test Component Content</div> `
})
class TestComponent {}

describe('Sheet Overlay component', () => {
  let spectator: Spectator<SheetOverlayComponent>;

  const createHost = createHostFactory({
    component: SheetOverlayComponent,
    imports: [ButtonModule, HttpClientTestingModule],
    providers: [
      mockProvider(NavigationService),
      {
        provide: PopoverRef,
        useValue: {
          height: jest.fn(),
          close: jest.fn()
        }
      },
      {
        provide: GLOBAL_HEADER_HEIGHT,
        useValue: 20
      }
    ]
  });

  test('should display the title', () => {
    spectator = createHost(
      `
    <htc-sheet-overlay>
    </htc-sheet-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'test title',
              content: TestComponent,
              size: SheetSize.Small
            }
          }
        ]
      }
    );

    expect(spectator.query('.header')).toHaveText('test title');
  });

  test('uses the requested size', () => {
    spectator = createHost(
      `
    <htc-sheet-overlay>
    </htc-sheet-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'test title',
              content: TestComponent,
              size: SheetSize.Large
            }
          }
        ]
      }
    );

    expect(spectator.query('.sheet-overlay')).toHaveClass('sheet-size-large');
  });

  test('closes on close button click', () => {
    spectator = createHost(
      `
    <htc-sheet-overlay>
    </htc-sheet-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'test title',
              content: TestComponent,
              size: SheetSize.Small
            }
          }
        ]
      }
    );
    spectator.click('.close-button');
    expect(spectator.query('.sheet-overlay')).toBeNull();
    expect(spectator.inject(PopoverRef).close).toHaveBeenCalled();
  });

  test('displays contents provided', () => {
    spectator = createHost(
      `
      <htc-sheet-overlay>
      </htc-sheet-overlay>
      `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'test title',
              content: TestComponent,
              size: SheetSize.Small
            }
          }
        ]
      }
    );

    expect(spectator.query('.content')).toHaveText('Test Component Content');
  });
});
