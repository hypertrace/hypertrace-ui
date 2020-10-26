import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider, Spectator } from '@ngneat/spectator/jest';
import { ButtonModule } from '../../button/button.module';
import { ModalSize } from '../../modal/modal';
import { POPOVER_DATA } from '../../popover/popover';
import { PopoverRef } from '../../popover/popover-ref';
import { ModalOverlayComponent } from './modal-overlay.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'test-modal-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="test-modal-content">Test Component Content</div> `
})
class TestComponent {}

describe('Modal Overlay component', () => {
  let spectator: Spectator<ModalOverlayComponent>;

  const createHost = createHostFactory({
    component: ModalOverlayComponent,
    imports: [ButtonModule, HttpClientTestingModule],
    providers: [
      mockProvider(NavigationService),
      {
        provide: PopoverRef,
        useValue: {
          height: jest.fn(),
          close: jest.fn()
        }
      }
    ]
  });

  test('should display the title', () => {
    spectator = createHost(
      `
    <ht-modal-overlay>
    </ht-modal-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'Create User',
              content: TestComponent,
              size: ModalSize.Small
            }
          }
        ]
      }
    );

    expect(spectator.query('.header')).toHaveText('Create User');
  });

  test('uses the requested size', () => {
    spectator = createHost(
      `
    <ht-modal-overlay size="${ModalSize.Small}">
    </ht-modal-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'Create User',
              content: TestComponent,
              size: ModalSize.Small
            }
          }
        ]
      }
    );
    expect(spectator.query('.modal-overlay')).toHaveClass('modal-size-small');
  });

  test('closes on close button click', () => {
    spectator = createHost(
      `
    <ht-modal-overlay>
    </ht-modal-overlay>
    `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'Create User',
              content: TestComponent,
              size: ModalSize.Small
            }
          }
        ]
      }
    );
    spectator.click('.close-button');
    expect(spectator.query('.modal-overlay')).toBeNull();
  });

  test('displays contents provided', () => {
    spectator = createHost(
      `
      <ht-modal-overlay>
      </ht-modal-overlay>
      `,
      {
        providers: [
          {
            provide: POPOVER_DATA,
            useValue: {
              showHeader: true,
              title: 'Create User',
              content: TestComponent,
              size: ModalSize.Small
            }
          }
        ]
      }
    );

    expect(spectator.query('.content')).toHaveText('Test Component Content');
  });
});
