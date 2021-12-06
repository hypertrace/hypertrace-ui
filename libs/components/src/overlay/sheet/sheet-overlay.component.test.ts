import { ChangeDetectionStrategy, Component, Inject, Injector, Optional } from '@angular/core';
import { GLOBAL_HEADER_HEIGHT, LayoutChangeService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ButtonComponent } from '../../button/button.component';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { SheetOverlayConfig, SheetSize, SHEET_DATA } from './sheet';
import { SheetOverlayComponent } from './sheet-overlay.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'test-sheet-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="test-modal-content">Test Component Content</div> `
})
class TestComponent {
  public constructor(
    public readonly injector: Injector,
    @Optional() @Inject(SHEET_DATA) public readonly data: unknown
  ) {}
}

describe('Sheet Overlay component', () => {
  let spectator: Spectator<SheetOverlayComponent>;

  const createHost = createHostFactory({
    component: SheetOverlayComponent,
    declarations: [MockComponent(ButtonComponent), TestComponent],
    shallow: true,
    template: `
  <ht-sheet-overlay>
  </ht-sheet-overlay>
    `,
    providers: [
      {
        provide: GLOBAL_HEADER_HEIGHT,
        useValue: 20
      },
      mockProvider(LayoutChangeService)
    ]
  });

  const createConfiguredHost = (configOverrides: Partial<SheetOverlayConfig> = {}) =>
    createHost(undefined, {
      providers: [
        {
          provide: PopoverRef,
          useValue: {
            height: jest.fn(),
            close: jest.fn()
          }
        },
        {
          provide: POPOVER_DATA,
          deps: [Injector],
          useFactory: (injector: Injector) => ({
            config: {
              showHeader: true,
              title: 'test title',
              content: TestComponent,
              size: SheetSize.Small,
              closeOnEscapeKey: true,
              ...configOverrides
            },
            injector: Injector.create({
              providers: [
                {
                  provide: SHEET_DATA,
                  useValue: configOverrides.data
                }
              ],
              // Normally, this would be a root injector when this is invoked from a service
              parent: injector
            })
          })
        }
      ]
    });

  test('should display the title', () => {
    spectator = createConfiguredHost({
      title: 'expected title'
    });

    expect(spectator.query('.header')).toHaveText('expected title');
  });

  test('uses the requested size', () => {
    spectator = createConfiguredHost({
      size: SheetSize.Large
    });
    expect(spectator.query('.sheet-overlay')).toHaveClass('sheet-size-large');
  });

  test('closes on close button click', () => {
    spectator = createConfiguredHost();

    spectator.click('.close-button');
    expect(spectator.query('.sheet-overlay')).toBeNull();
    expect(spectator.inject(PopoverRef).close).toHaveBeenCalled();
  });

  test('closes on press ESC key', () => {
    spectator = createConfiguredHost();

    spectator.dispatchKeyboardEvent(document, 'keydown', { key: 'Escape', keyCode: 27 });
    expect(spectator.inject(PopoverRef).close).toHaveBeenCalled();
    expect(spectator.query('.sheet-overlay')).toBeNull();
  });

  test('displays contents provided', () => {
    spectator = createConfiguredHost();

    expect(spectator.query('.content')).toHaveText('Test Component Content');
  });

  test('exposes correct data to content', () => {
    spectator = createConfiguredHost({
      data: 42
    });

    expect(spectator.query(TestComponent)?.data).toBe(42);
  });
});
