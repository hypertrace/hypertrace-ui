import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { NavigationService } from '@hypertrace/common';
import { createHostFactory, mockProvider } from '@ngneat/spectator/jest';
import { EMPTY } from 'rxjs';
import { ModalRef, ModalSize, MODAL_DATA } from './modal';
import { ModalModule } from './modal.module';
import { ModalService } from './modal.service';

describe('Modal service', () => {
  @Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <div class="test-modal-content">Test Component Content Data: {{ this.data }}</div>
      <button class="test-close-button" (click)="this.modalRef.close(this.data)">Close</button>
    `
  })
  class TestComponent {
    public constructor(@Inject(MODAL_DATA) public readonly data: string, public readonly modalRef: ModalRef<string>) {}
  }

  const createHost = createHostFactory({
    component: Component({ selector: 'host', template: 'template' })(class {}),
    declarations: [TestComponent],
    entryComponents: [TestComponent],
    imports: [ModalModule],
    providers: [
      mockProvider(NavigationService, {
        navigation$: EMPTY
      })
    ],
    template: `<host></host>`
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('can create a modal with provided data', fakeAsync(() => {
    const spectator = createHost();
    spectator.inject(ModalService).createModal({
      content: TestComponent,
      size: ModalSize.Small,
      data: 'custom input'
    });

    spectator.tick();

    expect(spectator.query('.test-modal-content', { root: true })).toContainText(
      'Test Component Content Data: custom input'
    );
  }));

  test('modal can be closed and return a result', fakeAsync(() => {
    const spectator = createHost();
    const modal: ModalRef<string> = spectator.inject(ModalService).createModal({
      content: TestComponent,
      size: ModalSize.Small,
      data: 'custom input'
    });
    let result: string | undefined;
    spectator.tick();
    const subscription = modal.closed$.subscribe(out => (result = out));
    const closeButton = spectator.query('.test-close-button', { root: true })!;
    expect(result).toBeUndefined();
    expect(subscription.closed).toBe(false);

    spectator.click(closeButton);

    expect(spectator.query('.test-modal-content', { root: true })).not.toExist();
    expect(result).toBe('custom input');
    expect(subscription.closed).toBe(true);

    flush(); // CDK timer to remove overlay
  }));

  test('modal can be closed on press ESC key', fakeAsync(() => {
    const spectator = createHost();
    const modal: ModalRef<string> = spectator.inject(ModalService).createModal({
      content: TestComponent,
      size: ModalSize.Small,
      data: 'custom input'
    });

    spectator.tick();
    const subscription = modal.closed$.subscribe();
    expect(subscription.closed).toBe(false);

    spectator.dispatchKeyboardEvent(document, 'keydown', { key: 'Escape', keyCode: 27 });

    expect(spectator.query('.test-modal-content', { root: true })).not.toExist();
    expect(subscription.closed).toBe(true);

    flush();
  }));
});
