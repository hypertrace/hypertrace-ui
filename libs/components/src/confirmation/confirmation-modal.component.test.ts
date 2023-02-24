import { StaticProvider } from '@angular/core';
import { createComponentFactory } from '@ngneat/spectator/jest';
import { MockComponent } from 'ng-mocks';
import { ButtonRole } from '../button/button';
import { ButtonComponent } from '../button/button.component';
import { ModalRef, MODAL_DATA } from '../modal/modal';
import { ConfirmationModalComponent, ConfirmationModalData } from './confirmation-modal.component';

describe('Confirmation modal', () => {
  const createComponent = createComponentFactory({
    component: ConfirmationModalComponent,
    shallow: true,
    declarations: [MockComponent(ButtonComponent)],
    providers: [
      {
        provide: ModalRef,
        useFactory: () => ({
          close: jest.fn()
        })
      }
    ]
  });

  const buildProviders = (data: ConfirmationModalData): { providers: StaticProvider[] } => ({
    providers: [
      {
        provide: MODAL_DATA,
        useValue: data
      }
    ]
  });

  test('defaults correctly', () => {
    const spectator = createComponent(buildProviders({ content: 'confirmation description' }));

    expect(spectator.query('.description')).toHaveText('confirmation description');

    const buttons = spectator.queryAll(ButtonComponent);
    expect(buttons.length).toBe(2);

    expect(buttons[0].label).toEqual('Cancel');
    expect(buttons[1].role).toEqual(ButtonRole.Additive);
    expect(buttons[1].label).toEqual('Confirm');
  });

  test('displays provided labels and text', () => {
    const spectator = createComponent(
      buildProviders({
        content: 'confirmation description',
        cancelButtonLabel: 'boom',
        confirmButtonLabel: 'good',
        confirmButtonRole: ButtonRole.Destructive
      })
    );

    const buttons = spectator.queryAll(ButtonComponent);
    expect(buttons.length).toBe(2);

    expect(buttons[0].label).toEqual('boom');
    expect(buttons[1].role).toEqual(ButtonRole.Destructive);
    expect(buttons[1].label).toEqual('good');
  });

  test('closes with true on confirm', () => {
    const spectator = createComponent(
      buildProviders({
        content: 'confirmation description'
      })
    );

    const confirmButton = spectator.queryAll('ht-button')[1];

    spectator.click(confirmButton);

    expect(spectator.inject(ModalRef).close).toHaveBeenCalledWith(true);
  });

  test('closes with false on cancel', () => {
    const spectator = createComponent(
      buildProviders({
        content: 'confirmation description'
      })
    );

    const cancelButton = spectator.queryAll('ht-button')[0];

    spectator.click(cancelButton);

    expect(spectator.inject(ModalRef).close).toHaveBeenCalledWith(false);
  });
});
