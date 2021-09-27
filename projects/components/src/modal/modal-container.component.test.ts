import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { LayoutChangeService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { POPOVER_DATA } from '../popover/popover';
import { PopoverRef } from '../popover/popover-ref';
import { ModalConfig, ModalRef, ModalSize, MODAL_DATA } from './modal';
import { ModalContainerComponent } from './modal-container.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'test-modal-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="test-modal-content">Test Component Content Data: {{ this.data }}</div>
    <button class="test-close-button" (click)="this.modalRef.close('clicked')">Close</button>
  `
})
class TestComponent {
  public constructor(@Inject(MODAL_DATA) public readonly data: string, public readonly modalRef: ModalRef<string>) {}
}

describe('Modal Container component', () => {
  let spectator: Spectator<ModalContainerComponent>;

  const checkSyles = (width: string, height: string): void => {
    const modalContainer = spectator.query('.modal-container') as HTMLElement;
    expect(modalContainer.style.height).toBe(height);
    expect(modalContainer.style.width).toBe(width);
  };

  const createHost = createHostFactory({
    component: ModalContainerComponent,
    shallow: true,
    declarations: [TestComponent],
    template: `<ht-modal-container></ht-modal-container>`,
    providers: [
      {
        provide: PopoverRef,
        useValue: {
          height: jest.fn(),
          close: jest.fn()
        }
      },
      mockProvider(LayoutChangeService)
    ]
  });

  const createConfiguredHost = (
    config: ModalConfig,
    modalData: string = '',
    modalRefMock: Partial<ModalRef<unknown>> = {}
  ) =>
    createHost(undefined, {
      providers: [
        {
          provide: POPOVER_DATA,
          deps: [Injector],
          useFactory: (injector: Injector) => ({
            config: config,
            injector: Injector.create({
              providers: [
                {
                  provide: MODAL_DATA,
                  useValue: modalData
                },
                mockProvider(ModalRef, modalRefMock)
              ],
              parent: injector
            })
          })
        }
      ]
    });

  test('should display the title', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.Small
    });

    expect(spectator.query('.header')).toHaveText('Create User');
  });

  test('uses the requested small size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.Small
    });
    checkSyles('420px', '365px');
  });

  test('uses the requested medium size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.Medium
    });
    checkSyles('456px', '530px');
  });

  test('uses the requested large-short size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.LargeShort
    });
    checkSyles('640px', '540px');
  });

  test('uses the requested large size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.Large
    });
    checkSyles('640px', '720px');
  });

  test('uses the requested large-tall size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.LargeTall
    });
    checkSyles('640px', '800px');
  });

  test('uses the requested medium-wide size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: ModalSize.MediumWide
    });
    checkSyles('840px', '600px');
  });

  test('custom size', () => {
    spectator = createConfiguredHost({
      showControls: true,
      title: 'Create User',
      content: TestComponent,
      size: {
        width: 100,
        height: 100
      }
    });
    checkSyles('100px', '100px');
  });

  test('closes on close button click', () => {
    const closeFn = jest.fn();
    spectator = createConfiguredHost(
      {
        showControls: true,
        title: 'Create User',
        content: TestComponent,
        size: ModalSize.Small
      },
      'text',
      { close: closeFn }
    );

    spectator.click('.test-close-button');
    expect(closeFn).toHaveBeenCalledWith('clicked');
  });

  test('displays contents provided', () => {
    spectator = createConfiguredHost(
      {
        showControls: true,
        title: 'Create User',
        content: TestComponent,
        size: ModalSize.Small
      },
      'custom data'
    );

    expect(spectator.query('.content')).toHaveText('Test Component Content Data: custom data');
  });
});
